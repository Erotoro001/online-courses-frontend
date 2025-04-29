import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [lessons, setLessons] = useState([]);
  const [score, setScore] = useState(null);

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:3001/register', { email, password });
      alert('Реєстрація успішна');
    } catch (error) {
      alert('Помилка реєстрації');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/login', { email, password });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      alert('Вхід успішний');
    } catch (error) {
      alert('Помилка входу');
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await axios.get('http://localhost:3001/lessons', {
        headers: { Authorization: localStorage.getItem('token') },
      });
      setLessons(response.data);
    } catch (error) {
      alert('Помилка завантаження уроків');
    }
  };

  const handleTest = async (lessonId) => {
    const userAnswer = prompt('2 + 2 = ?');
    const isCorrect = userAnswer === '4';
    try {
      await axios.post(
        'http://localhost:3001/results',
        { lessonId, score: isCorrect ? 1 : 0 },
        { headers: { Authorization: localStorage.getItem('token') } }
      );
      setScore(isCorrect ? 'Правильно!' : 'Неправильно');
    } catch (error) {
      alert('Помилка збереження результату');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
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
          <button onClick={handleRegister}>Зареєструватися</button>
          <button onClick={handleLogin}>Увійти</button>
        </>
      ) : (
        <>
          <h1>Уроки</h1>
          <button onClick={fetchLessons}>Завантажити уроки</button>
          <ul>
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                {lesson.title} <button onClick={() => handleTest(lesson.id)}>Пройти тест</button>
              </li>
            ))}
          </ul>
          {score && <p>Результат: {score}</p>}
        </>
      )}
    </div>
  );
}

export default App;