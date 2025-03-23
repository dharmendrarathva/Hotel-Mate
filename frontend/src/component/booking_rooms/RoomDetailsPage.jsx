import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import DatePicker from 'react-datepicker';

const RoomDetailsPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [roomDetails, setRoomDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalGuests, setTotalGuests] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userId, setUserId] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.getRoomById(roomId);
        setRoomDetails(response.room);
        const userProfile = await ApiService.getUserProfile();
        setUserId(userProfile.user.id);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [roomId]);

  const handleConfirmBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      setErrorMessage('Please select check-in and check-out dates.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    if (isNaN(numAdults) || numAdults < 1 || isNaN(numChildren) || numChildren < 0) {
      setErrorMessage('Please enter valid numbers for adults and children.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const totalDays = Math.round(Math.abs((endDate - startDate) / oneDay)) + 1;
    const totalGuests = numAdults + numChildren;
    const roomPricePerNight = roomDetails.roomPrice;
    const totalPrice = roomPricePerNight * totalDays;

    setTotalPrice(totalPrice);
    setTotalGuests(totalGuests);
  };

  const acceptBooking = async () => {
    try {
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);

      const formattedCheckInDate = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const formattedCheckOutDate = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

      const booking = {
        checkInDate: formattedCheckInDate,
        checkOutDate: formattedCheckOutDate,
        numOfAdults: numAdults,
        numOfChildren: numChildren
      };

      const response = await ApiService.bookRoom(roomId, userId, booking);
      if (response.statusCode === 200) {
        setConfirmationCode(response.bookingConfirmationCode);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          navigate('/rooms');
        }, 10000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  if (isLoading) {
    return <p style={{ textAlign: 'center', margin: '50px auto', fontSize: '18px', color: '#666' }}>Loading room details...</p>;
  }

  if (error) {
    return <p style={{ textAlign: 'center', margin: '50px auto', fontSize: '18px', color: '#d9534f' }}>{error}</p>;
  }

  if (!roomDetails) {
    return <p style={{ textAlign: 'center', margin: '50px auto', fontSize: '18px', color: '#d9534f' }}>Room not found.</p>;
  }

  const { roomType, roomPrice, description, bookings } = roomDetails;

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      {showMessage && (
        <div style={{
          backgroundColor: '#dff0d8',
          color: '#3c763d',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '16px'
        }}>
          Booking successful! Confirmation code: {confirmationCode}. An SMS and email of your booking details have been sent to you.
        </div>
      )}

      {errorMessage && (
        <div style={{
          backgroundColor: '#f2dede',
          color: '#a94442',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '16px'
        }}>
          {errorMessage}
        </div>
      )}

      <h2 style={{
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: '20px',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px'
      }}>Room Details</h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>


        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          width: '100%'
        }}>
          <h3 style={{
            fontSize: '24px',
            color: '#34495e',
            marginBottom: '10px'
          }}>{roomType}</h3>

          <p style={{
            fontSize: '18px',
            color: '#2ecc71',
            fontWeight: 'bold',
            marginBottom: '15px'
          }}>Price: ${roomPrice} / night</p>

          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#7f8c8d',
            padding: '0 20px'
          }}>{description}</p>
        </div>

        {bookings && bookings.length > 0 && (
          <div style={{
            width: '100%',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '20px',
              color: '#34495e',
              marginBottom: '15px'
            }}>Existing Booking Details</h3>

            <ul style={{
              listStyle: 'none',
              padding: '0',
              margin: '0'
            }}>
              {bookings.map((booking, index) => (
                <li key={booking.id} style={{
                  backgroundColor: '#f8f9fa',
                  padding: '10px 15px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '15px'
                }}>
                  <span style={{ fontWeight: 'bold', color: '#3498db' }}>Booking {index + 1}</span>
                  <span>Check-in: {booking.checkInDate}</span>
                  <span>Check-out: {booking.checkOutDate}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setShowDatePicker(true)}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                fontSize: '16px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
            >
              Book Now
            </button>

            <button
              onClick={() => setShowDatePicker(false)}
              style={{
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                fontSize: '16px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7f8c8d'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#95a5a6'}
            >
              Go Back
            </button>
          </div>

          {showDatePicker && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '6px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '15px',
                marginBottom: '15px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    marginBottom: '5px',
                    color: '#34495e',
                    fontWeight: 'bold'
                  }}>Check-in Date:</p>
                  <DatePicker
                    selected={checkInDate}
                    onChange={(date) => setCheckInDate(date)}
                    selectsStart
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    placeholderText="Select check-in date"
                    dateFormat="dd/MM/yyyy"
                    style={{
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      width: '180px'
                    }}
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    marginBottom: '5px',
                    color: '#34495e',
                    fontWeight: 'bold'
                  }}>Check-out Date:</p>
                  <DatePicker
                    selected={checkOutDate}
                    onChange={(date) => setCheckOutDate(date)}
                    selectsEnd
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={checkInDate}
                    placeholderText="Select check-out date"
                    dateFormat="dd/MM/yyyy"
                    style={{
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      width: '180px'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '20px',
                marginBottom: '20px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#34495e',
                    fontWeight: 'bold'
                  }}>
                    Adults:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={numAdults}
                    onChange={(e) => setNumAdults(parseInt(e.target.value))}
                    style={{
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      width: '80px'
                    }}
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#34495e',
                    fontWeight: 'bold'
                  }}>
                    Children:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={numChildren}
                    onChange={(e) => setNumChildren(parseInt(e.target.value))}
                    style={{
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      width: '80px'
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                style={{
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#219653'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
              >
                Confirm Booking
              </button>
            </div>
          )}

          {totalPrice > 0 && (
            <div style={{
              backgroundColor: '#e8f4fd',
              padding: '20px',
              borderRadius: '6px',
              marginTop: '20px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '18px',
                marginBottom: '10px',
                color: '#2c3e50',
                fontWeight: 'bold'
              }}>
                Total Price: <span style={{ color: '#e74c3c' }}>${totalPrice}</span>
              </p>

              <p style={{
                fontSize: '16px',
                marginBottom: '20px',
                color: '#2c3e50'
              }}>
                Total Guests: {totalGuests}
              </p>

              <button
                onClick={acceptBooking}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  fontSize: '18px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
              >
                Accept Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;