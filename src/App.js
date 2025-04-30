import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiLogOut, FiLogIn, FiUser } from 'react-icons/fi';
import { FaGlobe, FaCloudSun, FaWater, FaUsers, FaCheckCircle, FaTimesCircle, FaHome } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import mainPageImage from './assets/images/main-page.jpg';
import lesson1Image from './assets/images/lesson1.jpg';
import lesson2Image from './assets/images/lesson2.jpg';
import lesson3Image from './assets/images/lesson3.jpg';
import lesson4Image from './assets/images/lesson4.jpg';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [lessons, setLessons] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testScore, setTestScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAuthScreen, setIsAuthScreen] = useState(false);
  const [isProfileScreen, setIsProfileScreen] = useState(false);
  const [isMainScreen, setIsMainScreen] = useState(true); // Новий стан для головного екрану
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [theme, setTheme] = useState('light');

  const API_URL = process.env.REACT_APP_API_URL || 'https://online-courses-backend.onrender.com';

  // Дані уроків із теоретичним матеріалом і зображеннями
  const lessonData = {
    1: {
      title: 'Вступ | Вступ до географії',
      theory: 'Географія — це наука, яка вивчає просторові закономірності розміщення природних, соціальних та економічних явищ на Землі. Вона поділяється на фізичну географію (вивчення природних об’єктів, таких як гори, річки, клімат) і соціально-економічну географію (дослідження людської діяльності, наприклад, населення, економіки, культури). У цьому вступному уроці ми розглянемо основні поняття, методи та історію розвитку географії як науки.',
      image: lesson1Image,
    },
    2: {
      title: 'Урок 1 | Клімат і погода',
      theory: 'Клімат — це багаторічний режим погоди, характерний для певної місцевості. Погода може змінюватися щодня, тоді як клімат є більш стабільним. Основні елементи клімату: температура, опади, вологість, атмосферний тиск. У цьому уроці ми дізнаємося, як формуються кліматичні зони, які фактори впливають на клімат (наприклад, широта, висота над рівнем моря, океанічні течії), і як клімат впливає на життя людей.',
      image: lesson2Image,
    },
    3: {
      title: 'Урок 2 | Гідросфера',
      theory: 'Гідросфера — це водна оболонка Землі, яка включає океани, моря, річки, озера, льодовики та підземні води. Світовий океан займає 71% поверхні планети. У цьому уроці ми розглянемо кругообіг води в природі, основні характеристики океанів (солоність, течії), а також значення води для життя на Землі та її вплив на клімат і ландшафти.',
      image: lesson3Image,
    },
    4: {
      title: 'Урок 3 | Населення світу',
      theory: 'Населення світу налічує понад 8 мільярдів людей (станом на 2025 рік). У цьому уроці ми розглянемо демографічні процеси: народжуваність, смертність, міграцію. Також вивчимо, як населення розподілене по континентах, які регіони є найбільш густонаселеними (наприклад, Південно-Східна Азія), і які фактори впливають на зростання населення (економіка, культура, освіта).',
      image: lesson4Image,
    },
  };

  // Зображення для головної сторінки
  const mainPageImageSrc = mainPageImage;

  // Питання для тестів (5 питань, 4 варіанти, 1 правильна відповідь)
  const questions = {
    1: [
      { question: 'Що вивчає географія?', options: ['Просторові закономірності', 'Хімічні реакції', 'Історію мистецтва', 'Математичні рівняння'], answer: 'Просторові закономірності' },
      { question: 'На які основні розділи поділяється географія?', options: ['Фізична і соціально-економічна', 'Теоретична і прикладна', 'Математична і хімічна', 'Історична і літературна'], answer: 'Фізична і соціально-економічна' },
      { question: 'Що є об’єктом вивчення фізичної географії?', options: ['Природні об’єкти', 'Економіка', 'Культура', 'Політика'], answer: 'Природні об’єкти' },
      { question: 'Що вивчає соціально-економічна географія?', options: ['Людську діяльність', 'Гірські породи', 'Клімат', 'Зірки'], answer: 'Людську діяльність' },
      { question: 'Який метод часто використовується в географії?', options: ['Картографічний', 'Хімічний аналіз', 'Математичне моделювання', 'Літературний аналіз'], answer: 'Картографічний' },
    ],
    2: [
      { question: 'Що таке клімат?', options: ['Багаторічний режим погоди', 'Щоденні зміни погоди', 'Температура повітря', 'Кількість опадів'], answer: 'Багаторічний режим погоди' },
      { question: 'Який фактор найбільше впливає на клімат?', options: ['Широта', 'Населення', 'Економіка', 'Культура'], answer: 'Широта' },
      { question: 'Що є елементом клімату?', options: ['Температура', 'Рівень освіти', 'Кількість доріг', 'Тип ґрунту'], answer: 'Температура' },
      { question: 'Як океанічні течії впливають на клімат?', options: ['Змінюють температуру', 'Не впливають', 'Збільшують населення', 'Зменшують вологість'], answer: 'Змінюють температуру' },
      { question: 'Яка кліматична зона найтепліша?', options: ['Тропічна', 'Полярна', 'Помірна', 'Субтропічна'], answer: 'Тропічна' },
    ],
    3: [
      { question: 'Що входить до гідросфери?', options: ['Океани і річки', 'Гірські породи', 'Атмосферні гази', 'Рослини'], answer: 'Океани і річки' },
      { question: 'Яку частину поверхні Землі займає Світовий океан?', options: ['71%', '50%', '30%', '90%'], answer: '71%' },
      { question: 'Що таке кругообіг води?', options: ['Цикл руху води в природі', 'Рух повітря', 'Зміна температури', 'Ріст рослин'], answer: 'Цикл руху води в природі' },
      { question: 'Що впливає на солоність океанів?', options: ['Випаровування', 'Температура повітря', 'Кількість риб', 'Рівень освіти'], answer: 'Випаровування' },
      { question: 'Як гідросфера впливає на клімат?', options: ['Регулює температуру', 'Збільшує населення', 'Зменшує вологість', 'Не впливає'], answer: 'Регулює температуру' },
    ],
    4: [
      { question: 'Скільки людей проживає у світі (2025)?', options: ['Понад 8 мільярдів', '5 мільярдів', '10 мільярдів', '3 мільярди'], answer: 'Понад 8 мільярдів' },
      { question: 'Що вивчає демографія?', options: ['Народжуваність і смертність', 'Гірські породи', 'Клімат', 'Рослини'], answer: 'Народжуваність і смертність' },
      { question: 'Який регіон є найбільш густонаселеним?', options: ['Південно-Східна Азія', 'Європа', 'Антарктида', 'Австралія'], answer: 'Південно-Східна Азія' },
      { question: 'Що впливає на зростання населення?', options: ['Економіка', 'Клімат', 'Гірські породи', 'Зірки'], answer: 'Економіка' },
      { question: 'Який континент має найбільше населення?', options: ['Азія', 'Африка', 'Європа', 'Австралія'], answer: 'Азія' },
    ],
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/register`, { email, password });
      alert('Реєстрація успішна');
    } catch (error) {
      console.error('Помилка реєстрації:', error.response?.data || error.message);
      setError('Помилка реєстрації: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      setError(null);
      setIsAuthScreen(false);
      setIsMainScreen(false); // Після входу переходимо до курсів
      alert('Вхід успішний');
    } catch (error) {
      console.error('Помилка входу:', error.response?.data || error.message);
      setError('Помилка входу: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLogout = useCallback(() => {
    setToken('');
    localStorage.removeItem('token');
    setLessons([]);
    setResults([]);
    setError(null);
    setIsAuthScreen(false);
    setIsProfileScreen(false);
    setIsMainScreen(true); // Повертаємося на головний екран
    alert('Ви вийшли з облікового запису');
  }, []);

  const handleGoToMainScreen = () => {
    setIsProfileScreen(false);
    setIsAuthScreen(false);
    setIsMainScreen(true); // Повертаємося на головний екран без логауту
  };

  const fetchLessons = useCallback(async () => {
    if (!token) {
      setError('Токен відсутній. Увійдіть заново.');
      handleLogout();
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/lessons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons(response.data);
      setError(null);
    } catch (error) {
      console.error('Помилка завантаження уроків:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        setError('Сесія закінчилася. Увійдіть заново.');
        handleLogout();
      } else {
        setError('Помилка завантаження уроків: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  }, [token, handleLogout, API_URL]);

  const fetchResults = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/user-results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(response.data);
      setError(null);
    } catch (error) {
      console.error('Помилка завантаження результатів:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        setError('Сесія закінчилася. Увійдіть заново.');
        handleLogout();
      } else {
        setError('Помилка завантаження результатів: ' + (error.response?.data?.error || error.message));
      }
    }
  }, [token, handleLogout, API_URL]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmail(response.data.email);
      setFirstName(response.data.firstName || '');
      setLastName(response.data.lastName || '');
      setError(null);
    } catch (error) {
      console.error('Помилка завантаження профілю:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        setError('Сесія закінчилася. Увійдіть заново.');
        handleLogout();
      } else {
        setError('Помилка завантаження профілю: ' + (error.response?.data?.error || error.message));
      }
    }
  }, [token, handleLogout, API_URL]);

  useEffect(() => {
    if (token && !isProfileScreen && !isMainScreen) {
      fetchLessons();
      fetchResults();
    }
    if (token && isProfileScreen) {
      fetchUserProfile();
    }
  }, [token, fetchLessons, fetchResults, fetchUserProfile, isProfileScreen, isMainScreen]);

  const handleUpdateProfile = async () => {
    try {
      const updateData = { email, firstName, lastName };
      if (newPassword) {
        updateData.password = newPassword;
      }
      await axios.put(`${API_URL}/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewPassword('');
      alert('Профіль успішно оновлено');
      setError(null);
    } catch (error) {
      console.error('Помилка оновлення профілю:', error.response?.data || error.message);
      setError('Помилка оновлення профілю: ' + (error.response?.data?.error || error.message));
    }
  };

  const startTest = (lessonId) => {
    if (!lessonId || !questions[lessonId]) {
      console.error('Некоректний lessonId для тесту:', lessonId);
      return;
    }
    setCurrentLessonId(lessonId);
    setCurrentQuestionIndex(0);
    setTestScore(0);
    setIsModalOpen(true);
  };

  const handleAnswer = (selectedOption) => {
    if (!currentLessonId || !questions[currentLessonId]) {
      console.error('Некоректний lessonId:', currentLessonId);
      setIsModalOpen(false);
      return;
    }

    const currentQuestions = questions[currentLessonId];
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
      fetchResults();
      setError(null);
    } catch (error) {
      console.error('Помилка збереження результату:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        setError('Сесія закінчилася. Увійдіть заново.');
        handleLogout();
      } else {
        setError('Помилка збереження результату: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const toggleLesson = (lessonId) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  // Функція для відключення контекстного меню та перетягування
  const handleImageProtection = (e) => {
    e.preventDefault();
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* Головний екран */}
      {(!token || isMainScreen) && !isAuthScreen ? (
        <div className="w-full max-w-5xl flex flex-col items-center">
          <header className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <button
              onClick={toggleTheme}
              className="button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
            >
              {theme === 'light' ? 'Темна тема' : 'Світла тема'}
            </button>
            <button
              onClick={() => setIsAuthScreen(true)}
              className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
            >
              <FiLogIn /> <span>Логін/Реєстрація</span>
            </button>
          </header>
          <main className="text-center flex-1">
            <img
              src={mainPageImageSrc}
              alt="GeoLearn Main Page"
              className="main-page-image w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-6 rounded-lg shadow-md"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found')}
              loading="lazy"
              onContextMenu={handleImageProtection}
              onDragStart={handleImageProtection}
            />
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
              GeoLearn
            </h1>
            <p className="text-base sm:text-lg text-textSecondary mb-6 px-2">
              Веб-застосунок GeoLearn створений для зручного вивчення географії через інтерактивні уроки та тести. Ви можете ознайомитися з теоретичним матеріалом, пройти тести та відстежувати свої результати. Зареєструйтеся, щоб розпочати навчання!
            </p>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="mb-4 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
            >
              Дізнатися більше
            </button>
          </main>
          <footer className="mt-auto text-textSecondary text-xs sm:text-sm text-center">
            <p>Розробник: Гопка Максим Сергійович, 4 курс, група ІПЗ-49К</p>
            <p>
              © 2025 Гопка Максим Сергійович. Усі права захищені. Ліцензія:{' '}
              <a
                href="https://github.com/erotoro001/online-courses-frontend/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                MIT License
              </a>
            </p>
          </footer>
        </div>
      ) : !token && isAuthScreen ? (
        <div className="w-full max-w-md bg-cardBackground rounded-lg shadow-lg p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-textPrimary mb-6 text-center">Реєстрація / Вхід</h1>
          {error && <p className="text-error mb-4 text-sm sm:text-base">{error}</p>}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
          />
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleRegister}
              className="flex-1 bg-primary text-white p-3 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
            >
              Зареєструватися
            </button>
            <button
              onClick={handleLogin}
              className="flex-1 bg-primary text-white p-3 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
            >
              Увійти
            </button>
          </div>
        </div>
      ) : isProfileScreen ? (
        <div className="w-full max-w-5xl flex flex-col min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center">
              <button
                onClick={handleGoToMainScreen}
                className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
              >
                <FaHome /> <span>Головна сторінка</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileScreen(false);
                  setIsMainScreen(false);
                }}
                className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
              >
                <span>Курси</span>
              </button>
              <h1 className="header-title text-2xl sm:text-3xl font-bold">Особистий кабінет</h1>
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={toggleTheme}
                className="button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
              >
                {theme === 'light' ? 'Темна тема' : 'Світла тема'}
              </button>
              <button
                onClick={() => setIsProfileScreen(true)}
                className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
              >
                <FiUser /> <span>Особистий кабінет</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-error text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm sm:text-base"
              >
                <FiLogOut /> <span>Вийти</span>
              </button>
            </div>
          </div>

          {error && <p className="text-error mb-4 text-sm sm:text-base">{error}</p>}

          <div className="w-full max-w-md bg-cardBackground rounded-lg shadow-lg p-6 mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-textPrimary mb-6 text-center">Редагувати профіль</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Новий пароль (залиште порожнім, якщо не змінюєте)"
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
            />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ім'я"
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Прізвище"
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
            />
            <button
              onClick={handleUpdateProfile}
              className="w-full bg-primary text-white p-3 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
            >
              Зберегти зміни
            </button>
          </div>

          <footer className="mt-auto text-textSecondary text-xs sm:text-sm text-center pt-6">
            <p>Розробник: Гопка Максим Сергійович, 4 курс, група ІПЗ-49К</p>
            <p>
              © 2025 Гопка Максим Сергійович. Усі права захищені. Ліцензія:{' '}
              <a
                href="https://github.com/erotoro001/online-courses-frontend/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                MIT License
              </a>
            </p>
          </footer>
        </div>
      ) : (
        <div className="w-full max-w-5xl flex flex-col min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center">
              <button
                onClick={handleGoToMainScreen}
                className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
              >
                <FaHome /> <span>Головна сторінка</span>
              </button>
              <h1 className="header-title text-2xl sm:text-3xl font-bold">Курси</h1>
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={toggleTheme}
                className="button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
              >
                {theme === 'light' ? 'Темна тема' : 'Світла тема'}
              </button>
              <button
                onClick={() => setIsProfileScreen(true)}
                className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
              >
                <FiUser /> <span>Особистий кабінет</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-error text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm sm:text-base"
              >
                <FiLogOut /> <span>Вийти</span>
              </button>
            </div>
          </div>

          {error && <p className="text-error mb-4 text-sm sm:text-base">{error}</p>}

          {loading ? (
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-8 w-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {lessons.map((lesson) => {
                const lessonResults = results.filter((result) => result.lessonId === lesson.id);
                const completed = lessonResults.length > 0;
                return (
                  <div
                    key={lesson.id}
                    className="lesson-card rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition"
                  >
                    <img
                      src={lessonData[lesson.id]?.image}
                      alt={lessonData[lesson.id]?.title}
                      className="lesson-image w-full h-32 sm:h-40 object-cover rounded-lg mb-4"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found')}
                      loading="lazy"
                      onContextMenu={handleImageProtection}
                      onDragStart={handleImageProtection}
                    />
                    <div className="flex items-center space-x-2">
                      {lesson.id === 1 && <FaGlobe className="text-primary" />}
                      {lesson.id === 2 && <FaCloudSun className="text-primary" />}
                      {lesson.id === 3 && <FaWater className="text-primary" />}
                      {lesson.id === 4 && <FaUsers className="text-primary" />}
                      <h2
                        className="lesson-title text-lg sm:text-xl font-semibold mb-2 cursor-pointer"
                        onClick={() => toggleLesson(lesson.id)}
                      >
                        {lessonData[lesson.id]?.title || lesson.title}
                      </h2>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div
                        className={`h-2.5 rounded-full ${completed ? 'bg-success' : 'bg-gray-400'}`}
                        style={{ width: completed ? '100%' : '0%' }}
                      ></div>
                    </div>
                    {expandedLesson === lesson.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4"
                      >
                        <p className="text-textSecondary mb-4 text-sm sm:text-base">{lessonData[lesson.id]?.theory}</p>
                        <button
                          onClick={() => startTest(lesson.id)}
                          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
                        >
                          Пройти тест
                        </button>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-cardBackground rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="results-header text-xl sm:text-2xl font-semibold mb-4">Ваші результати</h2>
            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm sm:text-base">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 sm:p-3 text-textPrimary">Урок</th>
                      <th className="p-2 sm:p-3 text-textPrimary">Оцінка (%)</th>
                      <th className="p-2 sm:p-3 text-textPrimary">Дата та час</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 sm:p-3">{lessonData[result.lessonId]?.title || `Урок ${result.lessonId}`}</td>
                        <td className="p-2 sm:p-3 flex items-center space-x-2">
                          {result.score >= 60 ? (
                            <FaCheckCircle className="text-success" />
                          ) : (
                            <FaTimesCircle className="text-error" />
                          )}
                          <span>{result.score.toFixed(2)}%</span>
                        </td>
                        <td className="p-2 sm:p-3">
                          {new Date(result.createdAt).toLocaleString('uk-UA', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-textSecondary text-sm sm:text-base">Ви ще не проходили тести.</p>
            )}
          </div>

          <footer className="mt-auto text-textSecondary text-xs sm:text-sm text-center pt-6">
            <p>Розробник: Гопка Максим Сергійович, 4 курс, група ІПЗ-49К</p>
            <p>
              © 2025 Гопка Максим Сергійович. Усі права захищені. Ліцензія:{' '}
              <a
                href="https://github.com/erotoro001/online-courses-frontend/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                MIT License
              </a>
            </p>
          </footer>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && currentLessonId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content rounded-lg p-4 sm:p-6 w-full max-w-md relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 text-textSecondary hover:text-textPrimary"
              >
                ✕
              </button>
              <h2 className="modal-text text-lg sm:text-xl font-semibold mb-4">
                Тест для {lessonData[currentLessonId]?.title || `Урок ${currentLessonId}`}
              </h2>
              <p className="modal-text text-textSecondary mb-4 text-sm sm:text-base">
                Питання {currentQuestionIndex + 1} із {questions[currentLessonId].length}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / questions[currentLessonId].length) * 100}%` }}
                ></div>
              </div>
              <p className="modal-question text-base sm:text-lg mb-4">
                {questions[currentLessonId][currentQuestionIndex].question}
              </p>
              <div className="space-y-2">
                {questions[currentLessonId][currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="modal-option w-full text-left p-3 border rounded-lg hover:bg-secondary transition text-sm sm:text-base"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;