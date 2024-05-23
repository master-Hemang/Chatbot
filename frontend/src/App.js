import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, Container, Paper, List, ListItem, ListItemText } from '@mui/material';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setAuthToken(token);
    }
  }, []);

  const handleLogin = async () => {
    // Placeholder login function
    const response = await axios.post('http://localhost:5000/login', { username: 'user', password: 'password' });
    setUser(response.data.user);
    setAuthToken(response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('authToken', response.data.token);
  };

  const sendMessage = async () => {
    const userMessage = { sender: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages([...messages, userMessage]);
    const response = await axios.post('http://localhost:5000/chat', { query: input }, { headers: { Authorization: `Bearer ${authToken}` } });
    const botMessage = { sender: 'bot', text: response.data.reply, timestamp: new Date().toISOString() };
    setMessages([...messages, userMessage, botMessage]);
    setInput('');
  };

  const handleReset = () => {
    setMessages([]);
  };

  return (
    <Container>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h4">E-commerce Sales Chatbot</Typography>
        {!user ? (
          <Button variant="contained" color="primary" onClick={handleLogin}>Login</Button>
        ) : (
          <>
            <List>
              {messages.map((msg, index) => (
                <ListItem key={index}>
                  <ListItemText primary={msg.text} secondary={msg.sender} />
                </ListItem>
              ))}
            </List>
            <TextField
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message here"
            />
            <Button variant="contained" color="primary" onClick={sendMessage} style={{ marginTop: '10px' }}>
              Send
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleReset} style={{ marginTop: '10px' }}>
              Reset
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default App;
