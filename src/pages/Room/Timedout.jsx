import React, {useEffect} from 'react'
import "./Timedout.css"
import { useNavigate,useParams } from 'react-router-dom'

const Timedout = () => {

    const navigate = useNavigate();
    const {id} = useParams();

    //fectching base URL
    const baseUrl = process.env.REACT_APP_BASE_URL;

    // Fetching Booking details
    useEffect(() => {
      const meetEndApi = async () => {
          try {
              const token = "JK$;M-5~y[$vq4siT+OE_foYx!e}TlD4sfW(!2Lg@a^tPI&;h0";
              const headers = {
                  'Authorization': `Bearer ${token}`,
              };
              const response = await fetch(`${baseUrl}/api/1/meet_completed?booking_id=${id}`, {
                  method: 'GET',
                  headers: headers
              });
              if (!response.ok) {
                  throw new Error("Network response was not ok");
              }
              
              
          } catch (error) {
              console.error("Error Booking details data:", error);
              
          }
      };

      meetEndApi();
      

  }, []);

    const handleClick=()=>{
        navigate(`/enter-meeting/${id}`)
    }

  return (
    <div>
        <div className='content-div'>
            <h1 className='text-danger'>Sorry!</h1>
            <p>Your meeting has been timed out.</p>
            <button className='bt-home' onClick={handleClick}>Back to Home</button>
        </div>
    </div>
  )
}

export default Timedout