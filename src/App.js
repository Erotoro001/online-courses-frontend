import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [lessons, setLessons] = useState([]);
  const [score, setScore] = useState(null);

  // Використовуємо змінну середовища для URL бекенду
  const API_URL = process.env.REACT_APP_API_URL || 'https://online-courses-backend.onrender.com';

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/register`, { email, password });
      alert('Реєстрація успішна');
    } catch (error) {
      alert('Помилка реєстрації');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      alert('Вхід успішний');
    } catch (error) {
      alert('Помилка входу');
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await axios.get(`${API_URL}/lessons`);
      setLessons(response.data);
    } catch (error) {
      alert('Помилка завантаження уроків');
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
    const isCorrect = userAnswer?.toLowerCase() === answer.toLowerCase();
    try {
      await axios.post(`${API_URL}/results`, { lessonId, score: isCorrect ? 1 : 0 }); // Прибрали заголовок
      setScore(isCorrect ? 'Правильно!' : 'Неправильно');
    } catch (error) {
      alert('Помилка збереження результату');
      console.error(error); // Додай логування помилки
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