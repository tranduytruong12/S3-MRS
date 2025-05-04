import React, { useState, useEffect, useCallback } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  TimePicker, 
  Button, 
  Modal, 
  Checkbox, 
  Space, 
  Tag,
  message,
  notification,
  Divider,
  Tooltip,
  Spin,
  Radio,
  Table,
  Badge,
  App
} from 'antd';
import { 
  SearchOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './BookRoom.scss';

const { Option } = Select;
const { RangePicker } = TimePicker;

// Constants
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const WEEKDAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday'
};

// Time section definitions
const TIME_SECTIONS = {
  1: { label: '7:00 - 8:50', value: 1 },
  2: { label: '9:00 - 10:50', value: 2 },
  3: { label: '11:00 - 12:50', value: 3 },
  4: { label: '13:00 - 14:50', value: 4 },
  5: { label: '15:00 - 16:50', value: 5 },
};

// API Service functions
const API_BASE_URL = 'http://localhost:8080/api';

const fetchAllRooms = async () => {
  const response = await fetch(`${API_BASE_URL}/space`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  
  if (!response.ok) {
    throw new Error(`Error fetching rooms: ${response.status}`);
  }
  
  return await response.json();
};

const fetchRoomStatusByDay = async (dayOfWeek, timeSection, token = '') => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(
    `${API_BASE_URL}/room-status?date=${dayOfWeek}&section=${timeSection}`, 
    { method: "GET", headers }
  );
  
  if (!response.ok) {
    throw new Error(`Error fetching room status: ${response.status}`);
  }
  
  return await response.json();
};

const fetchRoomDetailStatus = async (roomId, location, building, dayOfWeek, token = '') => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const apiUrl = `${API_BASE_URL}/room-status/${roomId}/${location}/${building}?date=${dayOfWeek}`;
  
  const response = await fetch(apiUrl, { method: "GET", headers });
  
  if (!response.ok) {
    throw new Error(`Error fetching room status: ${response.status}`);
  }
  
  return await response.json();
};

const checkRoomAvailability = async (roomId, location, building, dayOfWeek, timeSections, token = '') => {
  const headers = { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token || ''}`
  };

  const response = await fetch(
    `${API_BASE_URL}/room-status/${roomId}/${location}/${building}/check`, 
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        date: dayOfWeek,
        timeSections
      })
    }
  );
  
  if (!response.ok) {
    throw new Error(`Error checking availability: ${response.status}`);
  }
  
  return await response.json();
};

const bookRoom = async (bookingData, token = '') => {
  const headers = { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  const response = await fetch(
    `${API_BASE_URL}/bookings`, 
    {
      method: "POST",
      headers,
      body: JSON.stringify(bookingData)
    }
  );
  
  if (!response.ok) {
    throw new Error(`Error booking room: ${response.status}`);
  }
  
  return await response.json();
};

// Utility functions
const transformRoomsData = (roomsData) => {
  return roomsData.map(room => ({
    id: room.NoRoom,
    location: room.Location,
    name: `Room ${room.NoRoom}`,
    building: room.Building,
    roomType: room.TypeRoom?.toLowerCase().includes('cá nhân') ? 'Individual' : 'Group',
    status: 'available',
    equipment: ['Projector', 'Whiteboard', 'AC'],
    image: room.TypeRoom?.toLowerCase().includes('cá nhân') 
      ? `https://anlocgroup.com/wp-content/uploads/2022/05/thiet-ke-phong-lam-viec-ca-nhan-hien-dai-01.jpg` 
      : `https://phongdayhoc.vn/wp-content/uploads/2020/08/PHop-main_optimized.png`,
    emptys: room.Emptys || 0,
    noEmpty: room.NoEmpty || 0,
    timeSlotStatus: 'available'
  }));
};

const getTimeSectionFromHour = (hour) => {
  if (hour < 9) return 1; // 7:00-8:50
  if (hour < 11) return 2; // 9:00-10:50
  if (hour < 13) return 3; // 11:00-12:50
  if (hour < 15) return 4; // 13:00-14:50
  return 5; // 15:00-16:50
};

const getNextWeekday = (date, targetDay) => {
  // targetDay: 0 = Sunday, 1 = Monday, etc.
  const current = date.day();
  const daysToAdd = (targetDay + 7 - current) % 7;
  return date.add(daysToAdd, 'day');
};

const isDayInPast = (day) => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayIndex = WEEKDAYS.indexOf(day);
  
  // If the selected day is before today in the current week, it's in the past
  return dayIndex < currentDay;
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const BookingSuccessNotification = ({ reservation, room, dayOfWeek, timeSection }) => {
  const navigate = useNavigate();
  
  const goToHistory = () => {
    navigate('/history');
  };
  
  return (
    <div className="booking-success-notification">
      <p><strong>Reservation ID:</strong> {reservation?.ReservationID}</p>
      <p><strong>Room:</strong> {room.id}, {room.location}, {room.building}</p>
      <p><strong>Day:</strong> {capitalizeFirstLetter(dayOfWeek)}</p>
      <p><strong>Time:</strong> {TIME_SECTIONS[timeSection]?.label}</p>
      <p>Your reservation is confirmed!</p>
      <Button 
        type="primary" 
        size="small" 
        icon={<HistoryOutlined />} 
        onClick={goToHistory}
        className="view-history-btn"
      >
        View in History
      </Button>
    </div>
  );
};

const BookRoom = () => {
  const navigate = useNavigate();
  // Form and state hooks
  const [form] = Form.useForm();
  const [bookingForm] = Form.useForm();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTimeSection, setSelectedTimeSection] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(null);
  const [notificationApi, notificationContextHolder] = notification.useNotification();
  const [messageApi, messageContextHolder] = message.useMessage();

  // Fetch all rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch room availability when date or time section changes
  useEffect(() => {
    if (selectedDate) {
      fetchRoomAvailability();
      console.log("Date or time section changed, fetching availability", { 
        selectedDate: selectedDate.format('YYYY-MM-DD'), 
        selectedTimeSection 
      });
    }
  }, [selectedDate, selectedTimeSection]);

  // Callback functions for API operations
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching all rooms...");
      const data = await fetchAllRooms();
      console.log('Rooms data received:', data.length || 0, 'rooms');
      
      // Transform the API data to match our component needs
      const transformedRooms = transformRoomsData(data);
      
      console.log('Ready to display', transformedRooms.length, 'rooms');
      setAllRooms(transformedRooms);
      // Set initial search results to show all rooms
      setSearchResults(transformedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      messageApi.error('Failed to load rooms. Please try again later.');
      setAllRooms([]);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  const fetchRoomAvailability = useCallback(async (dayOfWeekParam) => {
    setAvailabilityLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Use parameter if provided, otherwise use selected date to get day of week
      const dayOfWeek = dayOfWeekParam || selectedDate.format('dddd').toLowerCase();
      console.log("Fetching availability for day:", dayOfWeek);
      
      // Check if the day is a weekend (Saturday or Sunday)
      if (dayOfWeek === 'saturday' || dayOfWeek === 'sunday') {
        console.log("Weekend selected, showing no rooms");
        setSearchResults([]);
        setAvailabilityLoading(false);
        return;
      }
      
      // For testing/demo purposes - use a dummy token if none exists
      const headers = { 
        "Content-Type": "application/json"
      };
      
      // Only add token if it exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      // If a specific time section is selected, fetch availability for that section
      if (selectedTimeSection !== null) {
        console.log(`Fetching availability for section ${selectedTimeSection} on ${dayOfWeek}`);
        
        try {
          const data = await fetchRoomStatusByDay(dayOfWeek, selectedTimeSection, token);
          
          if (data.success) {
            // Create a map of room availability by room ID
            const availabilityMap = {};
            data.rooms.forEach(room => {
              const key = `${room.NoRoom}_${room.Location}_${room.Building}`;
              availabilityMap[key] = room.Status;
            });
            
            console.log('Availability map created:', availabilityMap);
            setRoomAvailability(availabilityMap);
            
            // Update search results with availability info
            const updatedResults = allRooms.map(room => {
              const key = `${room.id}_${room.location}_${room.building}`;
              // Default to available if this room is not in the availability data
              const availability = availabilityMap[key] || 'available';
              return {
                ...room,
                timeSlotStatus: availability
              };
            });
            
            console.log(`Setting search results with availability (${updatedResults.length} rooms)`);
            setSearchResults(updatedResults);
          } else {
            console.error('API returned error:', data);
            messageApi.error(data.message || 'Failed to load room availability.');
            // Still show rooms but don't claim they're available
            setSearchResults(allRooms);
          }
        } catch (error) {
          console.error('Error fetching room status:', error);
          messageApi.error('Failed to load room availability.');
          setSearchResults(allRooms);
        }
      } else {
        // If no time section is selected, fetch all rooms without filtering by availability
        console.log("No time section selected, showing all rooms");
        setSearchResults(allRooms);
      }
    } catch (error) {
      console.error('Error fetching room availability:', error);
      messageApi.error('Failed to load room availability.');
      // Still show rooms but don't set availability status
      setSearchResults(allRooms);
    } finally {
      setAvailabilityLoading(false);
    }
  }, [allRooms, selectedDate, selectedTimeSection]);

  const fetchRoomDetailedAvailability = useCallback(async (room, dayOfWeek) => {
    try {
      if (!room) {
        console.error('No room selected');
        return;
      }
      
      const token = localStorage.getItem('token');
      console.log(`Fetching detailed availability for Room ${room.id} on ${dayOfWeek}`);
      
      // Update selectedDayOfWeek state
      setSelectedDayOfWeek(dayOfWeek);
      
      // Check if the day is a weekend
      if (dayOfWeek === 'saturday' || dayOfWeek === 'sunday') {
        return;
      }
      
      // Log the API URL being called
      const apiUrl = `${API_BASE_URL}/room-status/${room.id}/${room.location}/${room.building}?date=${dayOfWeek}`;
      console.log('Calling API:', apiUrl);
      
      try {
        const data = await fetchRoomDetailStatus(room.id, room.location, room.building, dayOfWeek, token);
        
        if (data.success) {
          // Update the room object with time slots
          const updatedRoom = {
            ...room,
            timeSlots: data.timeSlots.map(slot => ({
              ...slot,
              timeRange: TIME_SECTIONS[slot.TimeSection].label,
              Status: slot.Status
            }))
          };
          
          console.log(`Time slots for ${dayOfWeek}:`, updatedRoom.timeSlots);
          setSelectedRoom(updatedRoom);
        } else {
          // Keep error handling but remove messages
        }
      } catch (error) {
        console.error('Error fetching room status:', error);
        // Keep error handling but remove messages
      }
    } catch (error) {
      console.error('Error fetching room detailed availability:', error);
      // Keep error handling but remove messages
    }
  }, []);

  // Event handlers
  const handleSearch = useCallback((values) => {
    console.log('Search values:', values);
    
    // Filter the allRooms array based on search criteria
    const filteredRooms = allRooms.filter(room => {
      const matchesLocation = !values.location || room.location === values.location;
      const matchesBuilding = !values.building || room.building === values.building;
      const matchesRoomType = !values.roomType || room.roomType === values.roomType;
      const matchesEquipment = !values.equipment || 
        values.equipment.every(eq => room.equipment.includes(eq));
      return matchesLocation && matchesBuilding && matchesRoomType && matchesEquipment;
    });
    
    // If a specific time section is selected, filter by availability
    if (selectedTimeSection !== null) {
      // Add time slot availability to the results
      const roomsWithAvailability = filteredRooms.map(room => {
        const key = `${room.id}_${room.location}_${room.building}`;
        return {
          ...room,
          timeSlotStatus: roomAvailability[key] || 'available'
        };
      });
      
      setSearchResults(roomsWithAvailability);
    } else {
      // If no time section selected, show all rooms
      setSearchResults(filteredRooms.map(room => ({
        ...room,
        timeSlotStatus: 'available'
      })));
    }
  }, [allRooms, roomAvailability, selectedTimeSection]);

  const handleBookRoom = useCallback(async (values) => {
    setBookingLoading(true);
    
    try {
      // Make the API call to get the response
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (token && user) {
        const { dayOfWeek, timeSection, purpose, participants, notes } = values;
        
        const bookingData = {
          NoRoom: selectedRoom.id,
          Location: selectedRoom.location,
          Building: selectedRoom.building,
          Date_in_week: dayOfWeek.toLowerCase(),
          TimeSection: timeSection,
          Purpose: purpose,
          NumberOfParticipants: parseInt(participants) || 1,
          Notes: notes || ''
        };
        
        console.log('Sending booking data:', bookingData);
        
        const response = await fetch(`${API_BASE_URL}/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(bookingData)
        });
        
        const data = await response.json();
        console.log('Booking API response:', data);
        
        // Close modal first
        setIsModalVisible(false);
        bookingForm.resetFields();
        
        // Display notification with API response data
        if (data.success) {
          notificationApi.success({
            message: 'Booking Successful!',
            description: (
              <div>
                <p><strong>Reservation ID:</strong> {data.reservation?.ReservationID}</p>
                <p><strong>Room:</strong> {selectedRoom.id}</p>
                <p><strong>Location:</strong> {selectedRoom.location}, {selectedRoom.building}</p>
                <p><strong>Day:</strong> {capitalizeFirstLetter(dayOfWeek)}</p>
                <p><strong>Time:</strong> {TIME_SECTIONS[timeSection]?.label}</p>
              </div>
            ),
            duration: 6,
            placement: 'topRight',
            style: {
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '4px'
            },
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setBookingLoading(false);
    }
  }, [bookingForm, selectedRoom, notificationApi]);

  const showRoomDetails = useCallback(async (room) => {
    setSelectedRoom(room);
    setIsModalVisible(true);
    
    // Reset and set initial values for the booking form
    bookingForm.resetFields();
    if (room.roomType === 'Individual') {
      bookingForm.setFieldsValue({ participants: 1 });
    }
    
    // Default to Monday for initial load (we'll fetch data for that day)
    const defaultDay = 'monday';
    setSelectedDayOfWeek(defaultDay);
    
    // Set initial values - Monday is day 1
    const today = dayjs();
    const nextMonday = getNextWeekday(today, 1); // 1 = Monday
    const formattedDate = nextMonday.format('dddd, MMMM D, YYYY');
    
    bookingForm.setFieldsValue({ 
      dayOfWeek: defaultDay,
      date: formattedDate,
      dateObj: nextMonday
    });
    
    // Fetch detailed availability for this room on the default day
    fetchRoomDetailedAvailability(room, defaultDay);
  }, [bookingForm, fetchRoomDetailedAvailability]);

  // UI helper functions
  const getAvailabilityColumns = useCallback(() => [
    {
      title: 'Time Section',
      dataIndex: 'timeRange',
      key: 'timeRange',
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'available' ? 'success' : 'error'} 
          text={status === 'available' ? 'Available' : 'Occupied'} 
        />
      ),
    },
  ], []);

  const updateDateForDay = useCallback((dayOfWeek) => {
    // Get the day index (0 = Sunday, 1 = Monday, etc.)
    const dayIndex = WEEKDAYS.indexOf(dayOfWeek);
    if (dayIndex === -1) return; // Invalid day name
    
    // Find the next occurrence of the selected day
    const today = dayjs();
    let targetDate = today;
    
    // If today's day index is greater than the selected day index,
    // or if today is the same day but we want to show next week,
    // then move to the next week
    if (today.day() > dayIndex || (today.day() === dayIndex && today.hour() >= 17)) {
      const daysToAdd = 7 - (today.day() - dayIndex);
      targetDate = today.add(daysToAdd, 'day');
    } else {
      // Otherwise, find the next occurrence within this week
      const daysToAdd = dayIndex - today.day();
      targetDate = today.add(daysToAdd, 'day');
    }
    
    // Format date as string for read-only display: "Monday, May 20, 2024"
    const formattedDate = targetDate.format('dddd, MMMM D, YYYY');
    console.log(`Updating date to ${formattedDate} for ${dayOfWeek}`);
    
    // Store both the formatted string for display and the date object for API
    bookingForm.setFieldsValue({ 
      date: formattedDate,
      dateObj: targetDate // Store the actual date object in a hidden field
    });
  }, [bookingForm]);

  return (
    <div className="book-room">
      {notificationContextHolder}
      {messageContextHolder}
      <Header />
      <div className="book-room__content">
        <div className="book-room__header">
          <h1>Book a Study Room</h1>
          <p>Find and book available study rooms for your academic needs</p>
        </div>

        <Card className="book-room__filters">    
          <Form
            form={form}
            onFinish={handleSearch}
            layout="vertical"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="location" label="Location">
                  <Select placeholder="Select location" allowClear>
                    <Option value="KhuA">Khu A</Option>
                    <Option value="KhuB">Khu B</Option>
                    <Option value="KhuC">Khu C</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item name="building" label="Building">
                  <Select placeholder="Select building" allowClear>
                    <Option value="A1">Building A1</Option>
                    <Option value="A2">Building A2</Option>
                    <Option value="B1">Building B1</Option>
                    <Option value="C1">Building C1</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item name="roomType" label="Room type">
                  <Select placeholder="Select type" allowClear>
                    <Option value="Individual">Individual</Option>
                    <Option value="Group">Group</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item name="equipment" label="Required Equipment">
                  <Select mode="multiple" placeholder="Select equipment" allowClear>
                    <Option value="Projector">Projector</Option>
                    <Option value="Whiteboard">Whiteboard</Option>
                    <Option value="AC">Air Conditioner</Option>
                    <Option value="Computer">Computer</Option>
                    <Option value="Interactive Screen">Interactive Screen</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SearchOutlined />}
                    block
                  >
                    Search Rooms
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <div className="book-room__results">
          {loading || availabilityLoading ? (
            <div className="book-room__loading">
              <Spin size="large" />
              <p>Loading rooms...</p>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {searchResults.length > 0 ? (
                searchResults.map(room => (
                  <Col xs={24} sm={12} md={8} key={room.id}>
                    <Card 
                      className={`book-room__card ${room.timeSlotStatus === 'occupied' ? 'book-room__card--occupied' : ''}`}
                      cover={<img alt={room.name} src={room.image} />}
                      onClick={() => showRoomDetails(room)}
                      hoverable
                    >
                      <div className="book-room__card-content">
                        <div className="book-room__card-header">
                          <h3>{room.name}</h3>
                          <Tag color={room.timeSlotStatus === 'available' ? 'success' : 'error'}>
                            {room.timeSlotStatus === 'available' ? 'Available' : 'Occupied'}
                          </Tag>
                        </div>
                        
                        <div className="book-room__card-details">
                          <div className="book-room__card-info">
                            <p><UserOutlined /> {room.roomType}</p>
                            <p>Location: {room.location}, Building: {room.building}</p>
                            <p>Capacity: {room.emptys + room.noEmpty} people</p>
                            {selectedTimeSection && (
                              <p>Time: {TIME_SECTIONS[selectedTimeSection].label}</p>
                            )}
                          </div>
                          <div className="book-room__equipment">
                            {room.equipment.map((eq, index) => (
                              <Tag key={index} color="blue">{eq}</Tag>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <div className="book-room__no-results">
                    <p>No rooms found matching your criteria.</p>
                  </div>
                </Col>
              )}
            </Row>
          )}
        </div>

        <Modal
          title={
            <div className="book-room__modal-title">
              <span>Book Room: {selectedRoom?.name}</span>
              <Tag color={selectedRoom?.timeSlotStatus === 'available' ? 'success' : 'error'}>
                {selectedRoom?.timeSlotStatus === 'available' ? 'Available' : 'Occupied'}
              </Tag>
            </div>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedRoom && (
            <div className="book-room__modal">
              <div className="book-room__modal-header">
                <img src={selectedRoom.image} alt={selectedRoom.name} />
                <div className="book-room__modal-info">
                  <h2>{selectedRoom.name}</h2>
                  <div className="book-room__room-details">
                    <p><strong>Location:</strong> {selectedRoom.location}</p>
                    <p><strong>Building:</strong> {selectedRoom.building}</p>
                    <p><strong>Type:</strong> {selectedRoom.roomType}</p>
                    <p><strong>Capacity:</strong> {selectedRoom.emptys + selectedRoom.noEmpty} people</p>
                    <div className="book-room__equipment">
                      <strong>Equipment:</strong>
                      {selectedRoom.equipment.map((eq, index) => (
                        <Tag key={index} color="blue">{eq}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <Divider />
              
              {selectedRoom.timeSlots && (
                <div className="book-room__availability-table">
                  <h3>Room Availability for {capitalizeFirstLetter(selectedDayOfWeek || 'Selected Day')}</h3>
                  <Table 
                    columns={getAvailabilityColumns()} 
                    dataSource={selectedRoom.timeSlots}
                    pagination={false}
                    rowKey="TimeSection"
                    size="small"
                  />
                  <Divider />
                </div>
              )}

              <Form
                form={bookingForm}
                layout="vertical"
                onFinish={handleBookRoom}
                initialValues={{ dayOfWeek: 'monday' }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="date"
                      label="Selected Date"
                      rules={[{ required: true, message: 'Please select a day of week first' }]}
                    >
                      <Input
                        readOnly
                        style={{ width: '100%' }}
                        suffix={<CalendarOutlined />}
                      />
                    </Form.Item>
                    {/* Hidden field to store the actual date object */}
                    <Form.Item
                      name="dateObj"
                      hidden
                    >
                      <Input type="hidden" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="dayOfWeek"
                      label="Day of Week"
                      rules={[{ required: true, message: 'Please select a day' }]}
                    >
                      <Radio.Group 
                        buttonStyle="solid"
                        value={selectedDayOfWeek}
                        onChange={(e) => {
                          const selectedDay = e.target.value;
                          console.log('Day selected:', selectedDay);
                          
                          // Set the day of week in form
                          bookingForm.setFieldsValue({ dayOfWeek: selectedDay });
                          
                          // Update selected day state
                          setSelectedDayOfWeek(selectedDay);
                          
                          // Also update the date field to match the selected day
                          updateDateForDay(selectedDay);
                          
                          // Fetch availability data for the selected day
                          if (selectedRoom) {
                            fetchRoomDetailedAvailability(selectedRoom, selectedDay);
                          }
                        }}
                      >
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => {
                          const isPastDay = isDayInPast(day);
                          return (
                            <Radio.Button 
                              key={day} 
                              value={day}
                              disabled={isPastDay}
                              style={{ 
                                flex: '1',
                                width: 'calc(20% - 8px)',
                                textAlign: 'center',
                                margin: '0 4px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </Radio.Button>
                          );
                        })}
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="timeSection"
                      label="Select Time Section"
                      rules={[{ required: true, message: 'Please select a time section' }]}
                    >
                      <Radio.Group 
                        buttonStyle="solid"
                        className="book-room__time-section-group"
                      >
                        {Object.values(TIME_SECTIONS).map(section => {
                          const isOccupied = selectedRoom?.timeSlots?.find(
                            slot => slot.TimeSection === section.value
                          )?.Status === 'occupied';
                          
                          return (
                            <Radio.Button 
                              key={section.value} 
                              value={section.value}
                              disabled={isOccupied}
                              style={{ 
                                flex: '1',
                                width: 'calc(20% - 8px)',
                                textAlign: 'center',
                                margin: '0 4px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {section.label}
                              {isOccupied && <CloseCircleOutlined style={{ color: 'red', marginLeft: '4px' }} />}
                            </Radio.Button>
                          );
                        })}
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="purpose"
                  label="Purpose"
                  rules={[{ required: true, message: 'Please enter the purpose' }]}
                >
                  <Input.TextArea rows={3} placeholder="Enter the purpose of your booking" />
                </Form.Item>

                <Form.Item
                  name="participants"
                  label="Number of Participants"
                  rules={[{ required: true, message: 'Please enter the number of participants' }]}
                >
                  <Input 
                    type="number" 
                    min={1} 
                    max={selectedRoom.roomType === 'Group' ? 30 : 1}
                    disabled={selectedRoom.roomType === 'Individual'}
                    defaultValue={selectedRoom.roomType === 'Individual' ? 1 : undefined}
                  />
                </Form.Item>

                <Form.Item
                  name="notes"
                  label="Additional Notes"
                >
                  <Input.TextArea rows={3} placeholder="Any special requirements or notes" />
                </Form.Item>

                <div className="book-room__modal-footer">
                  <Tooltip title="You can cancel your booking up to 1 hour before the scheduled time">
                    <p className="book-room__cancellation-policy">
                      <InfoCircleOutlined /> Cancellation Policy
                    </p>
                  </Tooltip>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    loading={bookingLoading}
                    size="large"
                    icon={<CheckCircleOutlined />}
                    style={{ height: '48px', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    Book Now
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </Modal>
      </div>
      <Footer />
    </div>
  );
};

export default BookRoom; 