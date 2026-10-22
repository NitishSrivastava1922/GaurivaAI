import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Crown, Sparkles, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../features/createOrder.js";
import { verifyPayment } from "../features/verifyPayment.js";
import { setUserData } from "../redux/UserSlice";

function BillingDrawer({ open, onClose }) {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [feedback, setFeedback] = useState("");

  const creditsUsed = useMemo(() => {
    const currentCredits = Number(userData?.credits || 0);
    const totalCredits = Number(userData?.totalCredits || 100);
    return totalCredits > 0 ? Math.min(100, Math.round((currentCredits / totalCredits) * 100)) : 0;
  }, [userData?.credits, userData?.totalCredits]);

  const handleUpgrade = async (plan) => {
    try {
      setLoadingPlan(plan);
      setFeedback("");

      const data = await createOrder(plan);
      if (!data?.order?.id) {
        throw new Error(data?.message || "Unable to create payment order");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data?.order?.amount,
        currency: data?.order?.currency,
        name: "NexusAI",
        description: `${data?.plan?.name || plan} Plan`,
        order_id: data?.order?.id,
        handler: async (response) => {
          try {
            const verifyData = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const feedbackMessage =
              typeof verifyData?.message === "object"
                ? JSON.stringify(verifyData.message)
                : verifyData?.message;

            if (feedbackMessage === "Payment Verified") {
              setFeedback("Payment successful. Your plan has been upgraded.");
              dispatch(
                setUserData({
                  ...(userData || {}),
                  ...(verifyData?.user || {}),
                }),
              );
              onClose?.();
            } else {
              setFeedback(feedbackMessage || "Payment could not be verified.");
            }
          } catch (error) {
            console.error(error);
            setFeedback("Payment completed but verification failed.");
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      setFeedback(error?.message || "Something went wrong while starting checkout.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25 }}
            className="fixed right-0 top-0 z-50 h-screen w-95 bg-[#0f1117] border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <div className="text-white text-lg font-semibold">Billing</div>

                <div className="text-slate-400 text-sm">Plans & Credits</div>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
              >
                <X size={18} className="text-slate-300" />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl bg-linear-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-400/20 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-sm">Current Plan</p>
                    <h3 className="text-white text-xl font-bold capitalize">
                      {userData?.plan || "free"}
                    </h3>
                  </div>
                  <div className="rounded-full bg-yellow-400/15 p-2">
                    <Crown className="text-yellow-400" size={18} />
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Credits</span>
                  <span>
                    {userData?.credits || 0}/{userData?.totalCredits || 100}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${creditsUsed}%` }}
                  />
                </div>
              </div>
            </div>

            {feedback ? (
              <div className="mx-5 rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
                {feedback}
              </div>
            ) : null}

            <div className="px-5 flex-1 overflow-auto space-y-4 py-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-indigo-400" size={16} />
                  <h3 className="text-white font-semibold">Starter Plan</h3>
                </div>

                <p className="text-indigo-400 text-2xl font-bold mt-2">₹199</p>
                <p className="text-slate-400 text-sm mt-1">500 Credits</p>

                <button
                  className="mt-4 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 disabled:opacity-60"
                  onClick={() => handleUpgrade("starter")}
                  disabled={loadingPlan === "starter"}
                >
                  {loadingPlan === "starter" ? "Processing..." : "Upgrade"}
                </button>
              </div>
            </div>
            <div className="px-5 flex-1 overflow-auto space-y-4 pb-5">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <Crown className="text-yellow-400" size={16} />
                  <h3 className="text-white font-semibold">Pro Plan</h3>
                </div>

                <p className="text-indigo-400 text-2xl font-bold mt-2">₹499</p>
                <p className="text-slate-400 text-sm mt-1">5000 Credits</p>

                <button
                  className="mt-4 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 disabled:opacity-60"
                  onClick={() => handleUpgrade("pro")}
                  disabled={loadingPlan === "pro"}
                >
                  {loadingPlan === "pro" ? "Processing..." : "Upgrade"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BillingDrawer;
