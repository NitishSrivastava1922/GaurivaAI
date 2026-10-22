import Home from './pages/Home.jsx';
import { GetCurrentUser } from './features/GetCurrentUser.js';
import { useEffect } from 'react';
import { setSessionChecked, setUserData } from './redux/UserSlice.js';
import { useDispatch } from 'react-redux';

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const getUser = async () => {
      const data = await GetCurrentUser();
      dispatch(setUserData(data));
      dispatch(setSessionChecked(true));
    };
    getUser();
  }, [dispatch]);
  return (
    <>
    <Home/>
    </>
  )
}

export default App
