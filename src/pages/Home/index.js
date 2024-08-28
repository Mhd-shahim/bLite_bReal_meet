import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import {Row, Col} from "react-bootstrap"
import doctor_patient from "../../assets/images/doctor_patient_1.avif"
import LogoName from "../../assets/images/bLite bReal logo_Blue logo.png"
import "./Home.css"

const HomePage = () => {
    const [countdown, setCountdown] = useState(0); 
    const [isButtonDisabled, setIsButtonDisabled] = useState(true); 
    const [booking_details, setBooking_details] = useState([]);
    const [expiry, setExpiry] = useState(false);

    const { booking_id } = useParams(); 

    //status checking
    const status = booking_details.status
    const [invalid_status, setInvalidstatus] = useState(false);
    const invalid_statuses= [2,3,4]

    const statusView=()=>{
        for(let sts in invalid_statuses){
            if(invalid_statuses[sts] === status){
                setInvalidstatus(true)
            }
        }
    }

    //fectching base URL
    const baseUrl = process.env.REACT_APP_BASE_URL;

    // Fetching Booking details
    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const token = "JK$;M-5~y[$vq4siT+OE_foYx!e}TlD4sfW(!2Lg@a^tPI&;h0";
                const headers = {
                    'Authorization': `Bearer ${token}`,
                };
                const response = await fetch(`${baseUrl}/api/1/get_booking_details?booking_id=${booking_id}`, {
                    method: 'GET',
                    headers: headers
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const bookings = await response.json();
                setBooking_details(bookings)
                
            } catch (error) {
                console.error("Error Booking details data:", error);
                
            }
        };

        fetchBookingDetails();
        statusView();

    }, [booking_id]);

    const end_time = booking_details.end_time
    const doctor_name = booking_details.doctor_name
    const booking_date = booking_details.booking_date
    const booking_time = booking_details.booking_time
    const avg_consultation_time = booking_details.avg_consultation_time * -60
    


    function addMinutesToTime(time, minutesToAdd) {
        // Parse the input time string to get hours and minutes
        const [hours, minutes] = time.split(':').map(Number);
    
        // Create a new Date object with the given time
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
    
        // Add the specified number of minutes
        date.setMinutes(date.getMinutes() + minutesToAdd);
    
        // Format the new time as a string
        const newHours = date.getHours().toString().padStart(2, '0');
        const newMinutes = date.getMinutes().toString().padStart(2, '0');
    
        return `${newHours}:${newMinutes}`;
    }

    if(booking_details.booking_time && booking_details.avg_consultation_time){
        const meet_end_time = addMinutesToTime(booking_time, booking_details.avg_consultation_time)
        sessionStorage.setItem('meet_end_time', end_time)
    }
    
    function convertDateFormat(booking_date) {
        const [day, month, year] = booking_date.split('-');
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    }


    // const consultation_time = booking_details.booking_time; 
    const consultation_time = "22:10"
    // const consultation_date = booking_date ? convertDateFormat(booking_date) : "";
    const consultation_date = "2024-08-28"
    
    const  token = booking_details.token_no;
    
    const name =booking_details.token_no + "_" + booking_details.patient_name + "_" + booking_details.patient_mobile 
    
    // Function to convert time in HH:MM format to seconds since midnight
    const timeToSeconds = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60;
    };
    
    //fetching indian time
    const fetchCurrentIndianTime = async () => {
        try {
            const response = await fetch(`http://worldtimeapi.org/api/timezone/Asia/Kolkata`, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error("Failed to fetch booking details.");
            }
            const current_time = await response.json();
            console.log(current_time);
        } catch (error) {
            console.error("Error fetching current time:", error);
        }
    }

    useEffect(() => {
        fetchCurrentIndianTime();
        const intervalId = setInterval(() => {
            
            const date = new Date();

            const options = { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            const indianTime = new Intl.DateTimeFormat('en-US', options).formatToParts(date);
            
            const hours = indianTime.find(part => part.type === "hour").value;
            const minutes = indianTime.find(part => part.type === "minute").value;
            const seconds = indianTime.find(part => part.type === "second").value;

            // console.log(`Hours: ${hours}, Minutes: ${minutes}, Seconds: ${seconds}`);
            
            const now = new Date();
            const currentDateString = now.toISOString().split('T')[0];
            const currentSeconds = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
            // const currentSeconds = now.getHours() * 3600 + minutes * 60 + now.getSeconds();

            const consultationSeconds = timeToSeconds(consultation_time);
            const diffInSeconds = consultationSeconds - currentSeconds;

            if (currentDateString === consultation_date && diffInSeconds <= 600 && diffInSeconds > avg_consultation_time) {
                clearInterval(intervalId);
                setCountdown(0);
                setIsButtonDisabled(false);
                
            } else if (currentDateString < consultation_date || (currentDateString === consultation_date && diffInSeconds > 600)) {
                if(currentDateString < consultation_date){
                    setCountdown(0);
                    setIsButtonDisabled(true);
                }else{
                    setCountdown(diffInSeconds-600);
                    setIsButtonDisabled(true);
                }
            }
             else { 
                setCountdown(0);
                setIsButtonDisabled(true);
                setExpiry(true) 
            }
        }, 1000);
        sessionStorage.setItem('doctor', doctor_name)
        return () => clearInterval(intervalId);
    }, [consultation_date, consultation_time, avg_consultation_time]);

    const formatTime = (time) => {
        let hours = Math.floor(time / 3600);
        let minutes = Math.floor((time % 3600) / 60);
        let seconds = Math.floor(time % 60);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return hours + ':' + minutes + ':' + seconds;
    };

    const navigate = useNavigate();

    const handleRoomJoin = useCallback(() => {
        sessionStorage.setItem('client', 1);
        sessionStorage.setItem('doctor', doctor_name);
        navigate(`/room/${booking_id}/${name}`);
    }, [navigate, token, name]);

    return (
        <>  
            <div className='main-div-home'>
            <div className='main-heading-div'>
                {/* <h1 className='main-heading text-center'><b>RioEasyConnect</b></h1> */}
                <img src={LogoName} className='main-heading' style={{height:"100px"}} alt='logo'/>
            </div>

                <Row>
                    <Col md={6}>
                    <div className='container-home'>
                    {booking_details.errors ? 
                    <h3 className='text-center text-danger'><b>This booking is not found</b></h3>:
                    <div className='booking_details'>
                        <div className='mobile-main-heading-div'>
                            <div className='mobile-logo-div'>
                                <img src={LogoName} className='mobile-main-heading' style={{height:"100px"}} alt='logo'/>
                            </div>
                            {/* <hr className='mob-underline'/> */}
                        </div>
                        <div>
                        {/* {invalid_status == true ?
                        <div className='invalid-div'>
                            <h6 className='text-center text-danger message'><marquee>This booking is not allowed for meeting.</marquee></h6>
                        </div>
                        :
                        ""}   */}
                        <h5 className='sub-heading'>Booking Details</h5>
                        
                        {/* <p>Patient Name : <b>{booking_details.patient_name}</b></p> */}
                        {/* <p>Patient Mobile : <b>{booking_details.patient_mobile}</b></p> */}
                        <p>Doctor Name : <b>{booking_details.doctor_name}</b></p>
                        <hr />
                        {/* <p>Time Slot : <b>{booking_details.time_slot}</b></p> */}
                        {/* <hr /> */}
                        <p>Consultation Time : <b>{consultation_time}</b></p>
                        <hr />
                        <p>Consultation Date : <b>{booking_details.booking_date}</b></p>
                        <hr />

                        {/* {formatTime(countdown)} */}
                        {countdown > 0 ?<p>You can enter meeting within <b><span className='text-danger'>{formatTime(countdown)}</span></b> minutes</p>
                        :""
                        }
                        {expiry === true &&  invalid_status === false?
                        <div className='expired-div mb-2'>
                            <h6 className='text-center text-danger message'><marquee>Your booking has been expired.</marquee></h6>
                        </div>
                        :
                        null}
                        </div>
                        <div>
                        {!isButtonDisabled ? 
                        <div className='btn-div'>
                            <button
                                onClick={handleRoomJoin}
                                variant="contained"
                                color="primary"
                                className='button mb-3'
                                disabled={isButtonDisabled}
                            >
                                Enter Meeting
                            </button>
                        </div>:
                    ""}
                        </div>
                        
                    </div>}
                </div>
                </Col>
                <Col md={6}>
                <div className='second-div'>
                <img src={doctor_patient} className='cover-img' alt="doctor patient"/>
                </div>
                </Col>
                </Row>
            </div>

        </>
    );
};

export default HomePage;
