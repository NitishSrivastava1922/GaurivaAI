import api from "../../utils/axios.js";
import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/UserSlice.js";
import { GoogleLogo } from "../components/Icons.jsx";

const Dashboard = lazy(() => import("../components/Dashboard.jsx"));

function Home() {
  const {userData, sessionChecked}=useSelector((state)=>state.user);
  const dispatch=useDispatch();
  const googleLogin = async() => {
    const [{ signInWithPopup }, { auth, googleAuthProvider }] = await Promise.all([
      import("firebase/auth"),
      import("../../utils/firebase.js"),
    ]);
    const credential = await signInWithPopup(auth, googleAuthProvider);
    await credential.user.reload();
    const firebaseUser = auth.currentUser || credential.user;
    const token = await firebaseUser.getIdToken(true);
    const { data } = await api.post('/auth/login', { token });

    // Firebase's client user is the most reliable source for Google profile data.
    dispatch(setUserData({
      ...(data.user || {}),
      uid: data.user?.uid || data.uid || firebaseUser.uid,
      name: data.user?.name || firebaseUser.displayName,
      email: data.user?.email || firebaseUser.email,
      avatar: data.user?.avatar || firebaseUser.photoURL,
    }));
  }
  return (
    userData ? (
      <Suspense fallback={<div className="h-screen bg-black" />}>
        <Dashboard />
      </Suspense>
    ) : !sessionChecked ? (
      <div className="h-screen bg-black" aria-label="Checking session" />
    ) : (
      <main className="fixed inset-0 flex items-center justify-center bg-black/90 text-white backdrop-blur-xs">
        <div className="w-115 h-52 bg-[#13151c] border border-white/8 justify-center items-center rounded-lg flex flex-col gap-10">
          <div className="flex flex-col gap-1 items-center justify-center ">
            <h1 className="text-[17px] font-semibold text-slate-200 tracking-tight">Welcome to NexusAI</h1>
            <p className="text-[13px] text-slate-400">Please Log in to continue</p>
          </div>
          <button onClick={googleLogin} className="w-[90%] h-10 border border-white/8 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-800 transition-colors cursor-pointer duration-200 active:scale-95 bg-purple-500">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-white"><GoogleLogo size={17}/></span>
            <span className="text-[14px] text-slate-200 font-medium">Continue with Google</span>
          </button>
        </div>
      </main>
    )
  )
}

export default Home
