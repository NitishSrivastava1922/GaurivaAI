import redis from '../../../shared/redis.js'
import { getMessages, getUserMessages } from '../utils/getMessages.js';

const USER_MEMORY_LIMIT = 100;
const USER_MEMORY_TTL_SECONDS = 90 * 24 * 60 * 60;
const USER_MEMORY_PROMPT_LIMIT = 800;
const USER_MEMORY_RESPONSE_LIMIT = 1600;

const getUserMemoryKey = (userId) => `user-memory:${userId}`;

const getStoredUserMemory = async (userId) => {
    const cached = await redis.get(getUserMemoryKey(userId));
    if (cached) return JSON.parse(cached);

    const messages = await getUserMessages(userId);
    const pendingPrompts = new Map();
    const memories = [];

    messages.forEach((message) => {
        const conversationId = String(message.conversationId);
        if (message.role === "user") {
            pendingPrompts.set(conversationId, message.content);
        } else if (message.role === "assistant" && pendingPrompts.has(conversationId)) {
            memories.push({
                conversationId,
                prompt: pendingPrompts.get(conversationId),
                response: message.content,
                createdAt: new Date(message.createdAt).getTime(),
            });
        }
    });

    await redis.set(
        getUserMemoryKey(userId),
        JSON.stringify(memories.slice(-USER_MEMORY_LIMIT)),
        "EX",
        USER_MEMORY_TTL_SECONDS,
    );
    return memories.slice(-USER_MEMORY_LIMIT);
};

const getSearchTerms = (text) =>
    text
        .toLowerCase()
        .match(/[a-z0-9]{3,}/g)
        ?.filter((term, index, terms) => terms.indexOf(term) === index) || [];

export const getMemory = async (conversationId, userId) => {
    const key=`messages-${conversationId}`
    const cached=await redis.get(key)
    if(cached)return JSON.parse(cached);

    const messages = await getMessages(conversationId, userId);
    await redis.set(key,JSON.stringify(messages),"EX",24*60*60);
    return messages

}

export const clearMemory = async (conversationId) => {
    const key=`messages-${conversationId}`
    await redis.del(key);
};

export const saveUserMemory = async ({ userId, conversationId, prompt, response }) => {
    if (!userId) return;

    const key = getUserMemoryKey(userId);
    const memories = await getStoredUserMemory(userId);

    memories.push({
        conversationId,
        prompt: String(prompt).slice(0, USER_MEMORY_PROMPT_LIMIT),
        response: String(response).slice(0, USER_MEMORY_RESPONSE_LIMIT),
        createdAt: Date.now(),
    });

    await redis.set(
        key,
        JSON.stringify(memories.slice(-USER_MEMORY_LIMIT)),
        "EX",
        USER_MEMORY_TTL_SECONDS,
    );
};

export const getRelevantUserMemory = async ({ userId, conversationId, prompt }) => {
    if (!userId) return [];

    const searchTerms = getSearchTerms(prompt);
    const allMemories = await getStoredUserMemory(userId);
    const memories = allMemories
        .filter((memory) => memory.conversationId !== conversationId)
        .map((memory) => {
            const text = `${memory.prompt} ${memory.response}`.toLowerCase();
            const relevance = searchTerms.reduce(
                (score, term) => score + Number(text.includes(term)),
                0,
            );

            return { ...memory, relevance };
        })
        .filter((memory) => memory.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance || b.createdAt - a.createdAt)
        .slice(0, 3);

    if (memories.length || !/(previous|earlier|before|last chat|remember|we discussed|maine|pichle|pehle|baat)/i.test(prompt)) {
        return memories;
    }

    return allMemories
        .filter((memory) => memory.conversationId !== conversationId)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 3);
};
