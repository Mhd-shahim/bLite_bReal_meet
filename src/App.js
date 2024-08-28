import {Routes, Route} from 'react-router-dom'
import HomePage from './pages/Home';
import RoomPage from './pages/Room';
import Timedout from './pages/Room/Timedout';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <Routes>
      <Route path="/enter-meeting/:booking_id" element={<HomePage/>}/>
      <Route path="/room/:roomId/:name" element={<RoomPage/>}/>
      <Route path="/timed-out/:id" element={<Timedout/>}/>
    </Routes>
  );
}

export default App;
