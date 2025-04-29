import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [lessons, setLessons] = useState([]);
  const [score, setScore] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://online-courses-backend.onrender.com';

  // Перевіряємо токен при завантаженні сторінки
  useEffect(() => {
    if (token) {
      fetchLessons();
    }
  }, [token]);

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/register`, { email, password });
      alert('Реєстрація успішна');
    } catch (error) {
      console.error('Помилка реєстрації:', error.response?.data || error.message);
      alert('Помилка реєстрації: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      alert('Вхід успішний');
    } catch (error) {
      console.error('Помилка входу:', error.response?.data || error.message);
      alert('Помилка входу: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setLessons([]);
    setScore(null);
    alert('Ви вийшли з облікового запису');
  };

  const fetchLessons = async () => {
    try {
      const response = await axios.get(`${API_URL}/lessons`, {
        headers: { Authorization: token },
      });
      setLessons(response.data);
    } catch (error) {
      console.error('Помилка завантаження уроків:', error.response?.data || error.message);
      alert('Помилка завантаження уроків: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleTest = async (lessonId) => {
    const questions = {
      1: { question: '2 + 2 = ?', answer: '4' },
      2: { question: 'Столиця України?', answer: 'Київ' },
      3: { question: '3 * 3 = ?', answer: '9' },
      4: { question: 'Найвища гора світу?', answer: 'Еверест' },
    };
    const { question, answer } = questions[lessonId] || questions[1];
    const userAnswer = prompt(question);
    if (!userAnswer) return; // Якщо користувач скасував prompt
    const isCorrect = userAnswer.toLowerCase() === answer.toLowerCase();
    try {
      await axios.post(
        `${API_URL}/results`,
        { lessonId, score: isCorrect ? 1 : 0 },
        { headers: { Authorization: token } }
      );
      setScore(isCorrect ? 'Правильно!' : 'Неправильно');
    } catch (error) {
      console.error('Помилка збереження результату:', error.response?.data || error.message);
      alert('Помилка збереження результату: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="app-container">
      {!token ? (
        <>
          <h1>Реєстрація / Вхід</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
          />
          <div className="button-group">
            <button onClick={handleRegister}>Зареєструватися</button>
            <button onClick={handleLogin}>Увійти</button>
          </div>
        </>
      ) : (
        <>
          <div className="header">
            <h1>Уроки</h1>
            <button onClick={handleLogout} className="logout-button">Вийти</button>
          </div>
          <button onClick={fetchLessons}>Завантажити уроки</button>
          <ul>
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                {lesson.title} <button onClick={() => handleTest(lesson.id)}>Пройти тест</button>
              </li>
            ))}
          </ul>
          {score && <p className="result">{score}</p>}
        </>
      )}
    </div>
  );
}

export default App;