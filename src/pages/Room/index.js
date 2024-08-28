import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import toast, { Toaster } from 'react-hot-toast';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import "./index.css";

const RoomPage = () => {
    const { roomId, name } = useParams();
    const notify = () => toast.success('Doctor has been invited');
    const [viewDiv, setViewDiv] = useState(true);
    const [diffInMilliSeconds, setDiffInMilliSeconds] = useState();
    const [countdownDelay, setCountdownDelay] = useState()
    const [booking_details, setBooking_details] = useState([]);

    const baseUrl = process.env.REACT_APP_BASE_URL;
    const meetUrl = process.env.REACT_APP_MEET_URL;

    // MUI Snackbar state
    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState("");
    const [responseMessage, setResponseMessage] = useState("");

    const [meetExpired, SetMeetExpired] = useState(false);
    const client_user = sessionStorage.getItem('client');
    const [countdown, setCountdown] = useState(30); // Initial countdown value
    const [isWarningActive, setIsWarningActive] = useState(false);

    const [hideToast, setHideToast] = useState(false)
    const navigate = useNavigate();

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    const addMinutesToTime = (time, minutesToAdd) => {
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes + minutesToAdd);
        return date.toTimeString().slice(0, 5); // Returns HH:mm format
    };

    const fetchCurrentIndianTime = async () => {
        try {
            const response = await fetch(`https://blitedoctorapi.rioeasyconnect.com/time`);
            if (!response.ok) {
                throw new Error("Failed to fetch current time.");
            }
            const currentTime = await response.json();
            let api_time = new Date(currentTime.time)
            const now = new Date();
            // diffInMilliSeconds = api_time - now;
            setDiffInMilliSeconds(api_time - now);
            return new Date(currentTime.time);
        } catch (error) {
            console.error(error);
        }
    };
   
    useEffect(() => {
        fetchCurrentIndianTime();
        const fetchBookingDetails = async () => {
            try {
                const token = "JK$;M-5~y[$vq4siT+OE_foYx!e}TlD4sfW(!2Lg@a^tPI&;h0";
                const headers = { 'Authorization': `Bearer ${token}` };
                const response = await fetch(`${baseUrl}/api/1/get_booking_details?booking_id=${roomId}`, { method: 'GET', headers });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const bookings = await response.json();
                setBooking_details(bookings);
                // sessionStorage.setItem('meet_end_time', bookings.end_time);
                sessionStorage.setItem('meet_end_time', "22:45")

            } catch (error) {
                console.error("Error fetching booking details:", error);
            }
        };
        fetchBookingDetails();
    }, [roomId]);

    
    

    useEffect(() => {
        if (isWarningActive) {
            setResponseMessage(`The call will end in ${Math.floor(countdown / 60)} minutes and ${countdown % 60} seconds`);
            setSeverity('error');
            handleClick();
        }
    }, [countdown, isWarningActive]);

    const meetEndApi = async () => {
        try {
            const token = "JK$;M-5~y[$vq4siT+OE_foYx!e}TlD4sfW(!2Lg@a^tPI&;h0";
            const headers = { 'Authorization': `Bearer ${token}` };
            const response = await fetch(`${baseUrl}/api/1/meet_completed?booking_id=${roomId}`, { method: 'GET', headers });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
        } catch (error) {
            console.error("Error marking meeting as completed:", error);
        }
    };

    const submitMeetLink = async () => {
        try {
            const token = "JK$;M-5~y[$vq4siT+OE_foYx!e}TlD4sfW(!2Lg@a^tPI&;h0";
            const formData = new FormData();
            formData.append("booking_id", roomId);
            const doc = sessionStorage.getItem('doctor');
            const doc_name = doc ? doc.replace(/ /g, "_") : "";
            formData.append("meet_link", `${meetUrl}/#/room/${roomId}/${doc_name}`);
            const headers = { 'Authorization': `Bearer ${token}` };
            if (doc) {
                const response = await fetch(`${baseUrl}/api/1/submit_meet_link`, { method: 'POST', headers, body: formData });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                } else {
                    notify();
                }
            }
        } catch (error) {
            console.error("Error submitting meet link:", error);
        }
    };

    //function to minus minutes from a time string
    function subtractMinutesFromTime(timeString, minutesToSubtract) {
        // Split the time string into hours and minutes
        let [hours, minutes] = timeString.split(':').map(Number);
    
        // Create a new Date object with today's date and the provided time
        let date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
    
        // Subtract the specified minutes
        date.setMinutes(date.getMinutes() - minutesToSubtract);
    
        // Format the time back to HH:MM format
        let updatedHours = String(date.getHours()).padStart(2, '0');
        let updatedMinutes = String(date.getMinutes()).padStart(2, '0');
    
        return `${updatedHours}:${updatedMinutes}`;
    }

    //calculate difference between server time and start count down time
    function subtractTimes(laterTimeString, earlierTimeString) {
        // Parse the later time string into a Date object
        let laterTime = new Date(laterTimeString);
    
        // Split the earlier time string into hours and minutes
        let [hours, minutes] = earlierTimeString.split(':').map(Number);
    
        // Set the earlier time on the same date as the later time
        let earlierTime = new Date(laterTime);
        earlierTime.setHours(hours);
        earlierTime.setMinutes(minutes);
        earlierTime.setSeconds(0);  // Assume 0 seconds
    
        // Calculate the difference in milliseconds
        let differenceInMillis = earlierTime - laterTime;
        
        return differenceInMillis
    }
    
    const myMeeting = async (element) => {
        const doc = sessionStorage.getItem('doctor');
        const doc_name = doc ? doc.replace(/ /g, "_") : "";
        const appID = 684389075;
        const serverSecret = "dc43508872f8c6f375d7fbb36ce49960";
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId, Date.now().toString(), name);
        const zc = ZegoUIKitPrebuilt.create(kitToken);

        let meet_end_time = sessionStorage.getItem('meet_end_time') || "24:00";
        const [endHours, endMinutes] = meet_end_time.split(':').map(Number);
        const endMeetingAt = new Date();
        endMeetingAt.setHours(endHours, endMinutes, 0, 0);

                let remainingTime;
                const now = new Date();
                // remainingTime = endMeetingAt - now
                // console.log("rem",remainingTime)
                if(diffInMilliSeconds){
                    const adjustedSystemTime = new Date(now.getTime() + diffInMilliSeconds);
                    remainingTime = endMeetingAt - adjustedSystemTime
                }
            

            if (remainingTime <= 0) {
                // console.error("The specified end time has already passed.");
                SetMeetExpired(true);
                return;
            }

            let warningDelay;
            if(remainingTime){
                const warningTime = 900 * 1000; // 15 minutes before end
                warningDelay = remainingTime - warningTime;
            }

            const startCountdown = () => {
                
                let timeLeft = 900; // 15 minutes countdown
                setIsWarningActive(true);
                const intervalId = setInterval(() => {
                    timeLeft -= 1;
                    setCountdown(timeLeft);
                    if (timeLeft <= 0) {
                        clearInterval(intervalId);
                        setIsWarningActive(false);
                        setViewDiv(true);
                        navigate(`/timed-out/${roomId}`);
                        window.location.reload();
                        meetEndApi();
                    }
                }, 1000);
            };

            zc.joinRoom({
                container: element,
                sharedLinks: [
                    {
                        name: 'Copy link',
                        url: `${meetUrl}/#/room/${roomId}/${doc_name}`
                    }
                ],
                scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
                showScreenSharingButton: true,
                turnOnCameraWhenJoining: true,
                turnOnMicrophoneWhenJoining: true,
                showRoomTimer: true,
                maxUsers: 2,
                onJoinRoom: () => {
                    
                    setHideToast(false)
                    setViewDiv(false);
                    if (client_user && client_user == 1) {
                        submitMeetLink();
                        setResponseMessage("Please Wait, Doctor will be joining soon...");
                        setSeverity('error');
                        handleClick();
                    }
                    
                },
                onUserJoin: async () => {
                    setHideToast(false)
                    handleClose();

                    const current_time = await fetchCurrentIndianTime();
                    const startCountdownAt = subtractMinutesFromTime(meet_end_time, 15)
                    const delayInTime = subtractTimes(current_time, startCountdownAt)
                    setCountdownDelay(delayInTime/1000)
                    // Set a timer to show a warning message before ending the call                    
                    const warningTimer = setTimeout(() => startCountdown(), delayInTime);
                    
                    // Set a timer to end the meeting at the specified end time
                    const endTimer = setTimeout(() => {
                        if(remainingTime){
                            zc.destroy();
                            setViewDiv(true);
                            navigate(`/timed-out/${roomId}`);
                            window.location.reload();
                            meetEndApi();
                        }
                     }, remainingTime);

                    zc.on('roomLeft', () => {
                        clearTimeout(warningTimer);
                        clearTimeout(endTimer);
                    });
                },
                

                onReturnToHomeScreenClicked: () => {
                    setViewDiv(true);
                    window.location.reload();
                    handleClose();
                },
                onLeaveRoom: () => {
                    setHideToast(true)
                    handleClose();
                    meetEndApi();
                },
                onUserLeave: () => {
                    setHideToast(true)
                    zc.destroy();
                    setViewDiv(true);
                    navigate(`/room/${roomId}/${name}`);
                    window.location.reload();
                },
            });
    };

    return (
        <div className="main-div d-flex">
            <div className="d-flex ms-5">
                {hideToast === false ?
                <Snackbar
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    className="d-flex align-items-center"
                    severity={severity}
                    variant="filled"
                    sx={{ width: "fit-content", height: "fit-content", fontSize: "18px" }}
                >
                    {responseMessage}
                </Alert>
            </Snackbar>:""}
            </div>

            <Toaster />
            {viewDiv === true ?
            <h1 className='heading'></h1>:""}
            <div ref={myMeeting} className="room" />
        </div>
    );
};

export default RoomPage;



