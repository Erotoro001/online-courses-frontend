import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [lessons, setLessons] = useState([]);
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testScore, setTestScore] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL || 'https://online-courses-backend.onrender.com';

  // Питання для тестів (по 3 питання на урок)
  const questions = {
    1: [
      { question: '2 + 2 = ?', options: ['3', '4', '5'], answer: '4' },
      { question: '5 - 3 = ?', options: ['1', '2', '3'], answer: '2' },
      { question: '10 / 2 = ?', options: ['4', '5', '6'], answer: '5' },
    ],
    2: [
      { question: 'Столиця України?', options: ['Львів', 'Київ', 'Одеса'], answer: 'Київ' },
      { question: 'Найдовша річка України?', options: ['Дніпро', 'Дунай', 'Десна'], answer: 'Дніпро' },
      { question: 'Найвища гора України?', options: ['Говерла', 'Піп Іван', 'Брескул'], answer: 'Говерла' },
    ],
    3: [
      { question: '3 * 3 = ?', options: ['6', '9', '12'], answer: '9' },
      { question: '8 / 4 = ?', options: ['2', '3', '4'], answer: '2' },
      { question: '7 - 2 = ?', options: ['4', '5', '6'], answer: '5' },
    ],
    4: [
      { question: 'Найвища гора світу?', options: ['Еверест', 'К2', 'Кіліманджаро'], answer: 'Еверест' },
      { question: 'Найбільший океан?', options: ['Атлантичний', 'Індійський', 'Тихий'], answer: 'Тихий' },
      { question: 'Найдовша річка світу?', options: ['Амазонка', 'Ніл', 'Янцзи'], answer: 'Амазонка' },
    ],
  };

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

  const handleLogout = useCallback(() => {
    setToken('');
    localStorage.removeItem('token');
    setLessons([]);
    setResults([]);
    setScore(null);
    alert('Ви вийшли з облікового запису');
  }, []);

  const fetchLessons = useCallback(async () => {
    if (!token) {
      alert('Токен відсутній. Увійдіть заново.');
      handleLogout();
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/lessons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons(response.data);
    } catch (error) {
      console.error('Помилка завантаження уроків:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        alert('Сесія закінчилася. Увійдіть заново.');
        handleLogout();
      } else {
        alert('Помилка завантаження уроків: ' + (error.response?.data?.error || error.message));
      }
    }
  }, [token, handleLogout, API_URL]);

  const fetchResults = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/user-results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(response.data);
    } catch (error) {
      console.error('Помилка завантаження результатів:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        alert('Сесія закінчилася. Увійдіть заново.');
        handleLogout();
      } else {
        alert('Помилка завантаження результатів: ' + (error.response?.data?.error || error.message));
      }
    }
  }, [token, handleLogout, API_URL]);

  useEffect(() => {
    if (token) {
      fetchLessons();
      fetchResults();
    }
  }, [token, fetchLessons, fetchResults]);

  const startTest = (lessonId) => {
    setCurrentLessonId(lessonId);
    setCurrentQuestionIndex(0);
    setTestScore(0);
    setIsModalOpen(true);
  };

  const handleAnswer = (selectedOption) => {
    const currentQuestions = questions[currentLessonId] || questions[1];
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.answer;
    if (isCorrect) {
      setTestScore(testScore + 1);
    }

    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const finalScore = testScore + (isCorrect ? 1 : 0);
      submitTest(finalScore, currentQuestions.length);
      setIsModalOpen(false);
    }
  };

  const submitTest = async (finalScore, totalQuestions) => {
    try {
      const scorePercentage = (finalScore / totalQuestions) * 100;
      await axios.post(
        `${API_URL}/results`,
        { lessonId: currentLessonId, score: scorePercentage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScore(`Ви набрали ${finalScore} із ${totalQuestions} (${scorePercentage.toFixed(2)}%)`);
      fetchResults(); // Оновлюємо результати після тесту
    } catch (error) {
      console.error('Помилка збереження результату:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        alert('Сесія закінчилася. Увійдіть заново.');
        handleLogout();
      } else {
        alert('Помилка збереження результату: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {!token ? (
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-textPrimary mb-6 text-center">Реєстрація / Вхід</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex space-x-4">
            <button
              onClick={handleRegister}
              className="flex-1 bg-primary text-white p-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Зареєструватися
            </button>
            <button
              onClick={handleLogin}
              className="flex-1 bg-primary text-white p-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Увійти
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-textPrimary">Уроки</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Вийти
            </button>
          </div>

          {/* Секція уроків */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold text-textPrimary mb-2">{lesson.title}</h2>
                <p className="text-gray-600 mb-4">
                  Пройдіть тест, щоб перевірити свої знання з цього уроку.
                </p>
                <button
                  onClick={() => startTest(lesson.id)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Пройти тест
                </button>
              </div>
            ))}
          </div>

          {/* Секція результатів */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-textPrimary mb-4">Ваші результати</h2>
            {score && <p className="text-green-600 mb-4">{score}</p>}
            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-textPrimary">Урок</th>
                      <th className="p-3 text-textPrimary">Оцінка (%)</th>
                      <th className="p-3 text-textPrimary">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">Урок {result.lessonId}</td>
                        <td className="p-3">{result.score.toFixed(2)}%</td>
                        <td className="p-3">
                          {new Date(result.createdAt).toLocaleDateString('uk-UA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">Ви ще не проходили тести.</p>
            )}
          </div>
        </div>
      )}

      {/* Модальне вікно для тесту */}
      {isModalOpen && currentLessonId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-textPrimary mb-4">
              Тест для Уроку {currentLessonId}
            </h2>
            <p className="text-gray-600 mb-4">
              Питання {currentQuestionIndex + 1} із {questions[currentLessonId].length}
            </p>
            <p className="text-lg font-medium mb-4">
              {questions[currentLessonId][currentQuestionIndex].question}
            </p>
            <div className="space-y-2">
              {questions[currentLessonId][currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-secondary transition"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;