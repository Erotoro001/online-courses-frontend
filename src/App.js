import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiLogOut, FiLogIn, FiUser, FiMenu, FiX } from 'react-icons/fi';
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
  const [currentPage, setCurrentPage] = useState('home');
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Новий стан для меню

  const API_URL = process.env.REACT_APP_API_URL || 'https://online-courses-backend.onrender.com';

  const lessonData = {
    1: {
      title: 'Вступ | Вступ до географії',
      theory: 'Географія — це наука, яка досліджує просторові закономірності розміщення природних, соціальних та економічних явищ на Землі. Вона допомагає нам зрозуміти, як взаємодіють природа і людство. Географія поділяється на два основні розділи: фізична географія (вивчає природні об’єкти та явища, такі як гори, річки, клімат і ґрунти) та соціально-економічна географія (досліджує людську діяльність, зокрема населення, економіку, культуру та міста). У цьому вступному уроці ми ознайомимося з основними методами географії, такими як картографування та аналіз даних, а також дізнаємося про її значення для повсякденного життя.',
      image: lesson1Image,
    },
    2: {
      title: 'Урок 1 | Клімат і погода',
      theory: 'Клімат — це багаторічний режим погоди, характерний для певної території. На відміну від погоди, яка змінюється щодня, клімат є стабільним і залежить від таких факторів: широта (ближче до екватора — тепліше, ближче до полюсів — холодніше), висота над рівнем моря (чим вище, тим холодніше), океанічні течії (теплі течії підвищують температуру, холодні — знижують). Основні елементи клімату включають температуру, опади, вологість і вітер. У цьому уроці ми розглянемо, як клімат впливає на природу і життя людей.',
      image: lesson2Image,
    },
    3: {
      title: 'Урок 2 | Гідросфера',
      theory: 'Гідросфера — це водна оболонка Землі, яка охоплює океани, моря, річки, озера, льодовики та підземні води. Світовий океан займає приблизно 71% поверхні планети і відіграє ключову роль у регулюванні клімату. У цьому уроці ми розглянемо кругообіг води (процес випаровування, конденсації та опадів), характеристики океанів (солоність, температура, течії) та значення води для життя, сільського господарства та економіки. Вода є основою життя на Землі, і її збереження — важливе завдання для людства.',
      image: lesson3Image,
    },
    4: {
      title: 'Урок 3 | Населення світу',
      theory: 'Населення світу перевищує 8 мільярдів людей (станом на 2025 рік). Демографія вивчає процеси народжуваності, смертності та міграції. У цьому уроці ми розглянемо розподіл населення (найбільше людей проживає в Азії, особливо в Південно-Східній Азії), фактори зростання (економіка, освіта, медицина) та проблеми (перенаселення, нестача ресурсів). Населення впливає на розвиток країн і потребує збалансованого підходу до планування.',
      image: lesson4Image,
    },
  };

  const mainPageImageSrc = mainPageImage;

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

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => { document.body.className = theme; }, [theme]);

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/register`, { email, password });
      alert('Реєстрація успішна');
      handleLogin();
    } catch (error) {
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
      setCurrentPage('courses');
      alert('Вхід успішний');
    } catch (error) {
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
    setCurrentPage('home');
    setIsMenuOpen(false); // Закриваємо меню при виході
  }, []);

  const fetchLessons = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/lessons`, { headers: { Authorization: `Bearer ${token}` } });
      setLessons(response.data);
      setError(null);
    } catch (error) {
      setError('Помилка завантаження уроків: ' + (error.response?.data?.error || error.message));
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  }, [token, handleLogout]);

  const fetchResults = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/user-results`, { headers: { Authorization: `Bearer ${token}` } });
      setResults(response.data);
      setError(null);
    } catch (error) {
      setError('Помилка завантаження результатів: ' + (error.response?.data?.error || error.message));
      if (error.response?.status === 401) handleLogout();
    }
  }, [token, handleLogout]);

  const fetchUserProfile = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/profile`, { headers: { Authorization: `Bearer ${token}` } });
      setEmail(response.data.email);
      setFirstName(response.data.firstName || '');
      setLastName(response.data.lastName || '');
      setError(null);
    } catch (error) {
      setError('Помилка завантаження профілю: ' + (error.response?.data?.error || error.message));
      if (error.response?.status === 401) handleLogout();
    }
  }, [token, handleLogout]);

  useEffect(() => {
    if (token && currentPage === 'courses') {
      fetchLessons();
      fetchResults();
    } else if (token && currentPage === 'profile') {
      fetchUserProfile();
    }
  }, [token, currentPage, fetchLessons, fetchResults, fetchUserProfile]);

  const handleUpdateProfile = async () => {
    try {
      const updateData = { email, firstName, lastName };
      if (newPassword) updateData.password = newPassword;
      await axios.put(`${API_URL}/profile`, updateData, { headers: { Authorization: `Bearer ${token}` } });
      setNewPassword('');
      alert('Профіль успішно оновлено');
      setError(null);
    } catch (error) {
      setError('Помилка оновлення профілю: ' + (error.response?.data?.error || error.message));
    }
  };

  const startTest = (lessonId) => {
    setCurrentLessonId(lessonId);
    setCurrentQuestionIndex(0);
    setTestScore(0);
    setIsModalOpen(true);
  };

  const handleAnswer = (selectedOption) => {
    const currentQuestions = questions[currentLessonId];
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.answer;
    if (isCorrect) setTestScore(testScore + 1);

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
      await axios.post(`${API_URL}/results`, { lessonId: currentLessonId, score: scorePercentage }, { headers: { Authorization: `Bearer ${token}` } });
      fetchResults();
      setError(null);
    } catch (error) {
      setError('Помилка збереження результату: ' + (error.response?.data?.error || error.message));
      if (error.response?.status === 401) handleLogout();
    }
  };

  const toggleLesson = (lessonId) => setExpandedLesson(expandedLesson === lessonId ? null : lessonId);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleImageProtection = (e) => {
    e.preventDefault();
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      {currentPage === 'home' && (
        <div className="w-full max-w-4xl flex flex-col items-center">
          <header className="w-full mb-6">
            <div className="flex justify-between items-center">
              <div className="md:flex md:space-x-4 hidden">
                <button onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                  <FaHome /> <span>Головна сторінка</span>
                </button>
                {token ? (
                  <button onClick={() => { setCurrentPage('courses'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    <span>Курси</span>
                  </button>
                ) : (
                  <button onClick={() => { setIsAuthScreen(true); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    <span>Курси</span>
                  </button>
                )}
              </div>
              <div className="md:flex md:space-x-4 hidden">
                <button onClick={toggleTheme} className="button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                  {theme === 'light' ? 'Темна тема' : 'Світла тема'}
                </button>
                {token ? (
                  <button onClick={() => { setCurrentPage('profile'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    <FiUser /> <span>Особистий кабінет</span>
                  </button>
                ) : (
                  <button onClick={() => { setIsAuthScreen(true); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    <FiUser /> <span>Особистий кабінет</span>
                  </button>
                )}
                {token ? (
                  <button onClick={handleLogout} className="flex items-center space-x-2 bg-error text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                    <FiLogOut /> <span>Вийти</span>
                  </button>
                ) : (
                  <button onClick={() => { setIsAuthScreen(true); setIsMenuOpen(false); }} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                    <FiLogIn /> <span>Увійти</span>
                  </button>
                )}
              </div>
              <button onClick={toggleMenu} className="md:hidden text-2xl">
                {isMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="md:hidden flex flex-col space-y-2 mt-2"
                >
                  <button onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    <FaHome /> <span>Головна сторінка</span>
                  </button>
                  {token ? (
                    <button onClick={() => { setCurrentPage('courses'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                      <span>Курси</span>
                    </button>
                  ) : (
                    <button onClick={() => { setIsAuthScreen(true); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                      <span>Курси</span>
                    </button>
                  )}
                  <button onClick={toggleTheme} className="button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    {theme === 'light' ? 'Темна тема' : 'Світла тема'}
                  </button>
                  {token ? (
                    <button onClick={() => { setCurrentPage('profile'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                      <FiUser /> <span>Особистий кабінет</span>
                    </button>
                  ) : (
                    <button onClick={() => { setIsAuthScreen(true); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                      <FiUser /> <span>Особистий кабінет</span>
                    </button>
                  )}
                  {token ? (
                    <button onClick={handleLogout} className="flex items-center space-x-2 bg-error text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                      <FiLogOut /> <span>Вийти</span>
                    </button>
                  ) : (
                    <button onClick={() => { setIsAuthScreen(true); setIsMenuOpen(false); }} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                      <FiLogIn /> <span>Увійти</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </header>
          <main className="text-center flex-1">
            <img src={mainPageImageSrc} alt="GeoLearn Main Page" className="w-full max-w-md mx-auto mb-6 rounded-lg shadow-md" onContextMenu={handleImageProtection} onDragStart={handleImageProtection} />
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">GeoLearn</h1>
            <p className="text-lg text-textSecondary mb-6">Веб-застосунок GeoLearn створений для зручного вивчення географії через інтерактивні уроки та тести. Ви можете ознайомитися з теоретичним матеріалом, пройти тести та відстежувати свої результати. Зареєструйтеся, щоб розпочати навчання!</p>
          </main>
          <footer className="mt-auto text-textSecondary text-sm text-center">
            <p>Розробник: Гопка Максим Сергійович, 4 курс, група ІПЗ-49К</p>
            <p>© 2025 Гопка Максим Сергійович. Усі права захищені.</p>
          </footer>
        </div>
      )}
      {isAuthScreen && !token && (
        <div className="w-full max-w-md bg-cardBackground rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-textPrimary mb-6 text-center">Реєстрація / Вхід</h1>
          {error && <p className="text-error mb-4">{error}</p>}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 mb-4 border rounded-lg" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" className="w-full p-3 mb-4 border rounded-lg" />
          <div className="flex space-x-4">
            <button onClick={handleRegister} className="flex-1 bg-primary text-white p-3 rounded-lg hover:bg-indigo-700 transition">Зареєструватися</button>
            <button onClick={handleLogin} className="flex-1 bg-primary text-white p-3 rounded-lg hover:bg-indigo-700 transition">Увійти</button>
          </div>
        </div>
      )}
      {currentPage === 'profile' && token && (
        <div className="w-full max-w-4xl flex flex-col min-h-screen">
          <header className="w-full mb-6">
            <div className="flex justify-between items-center">
              <div className="md:flex md:space-x-4 hidden">
                <button onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                  <FaHome /> <span>Головна сторінка</span>
                </button>
                <button onClick={() => { setCurrentPage('courses'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                  <span>Курси</span>
                </button>
              </div>
              <div className="md:flex md:space-x-4 hidden">
                <button onClick={toggleTheme} className="button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">{theme === 'light' ? 'Темна тема' : 'Світла тема'}</button>
                <button onClick={() => { setCurrentPage('profile'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition"><FiUser /> <span>Особистий кабінет</span></button>
                <button onClick={handleLogout} className="flex items-center space-x-2 bg-error text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"><FiLogOut /> <span>Вийти</span></button>
              </div>
              <button onClick={toggleMenu} className="md:hidden text-2xl">
                {isMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="md:hidden flex flex-col space-y-2 mt-2"
                >
                  <button onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    <FaHome /> <span>Головна сторінка</span>
                  </button>
                  <button onClick={() => { setCurrentPage('courses'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    <span>Курси</span>
                  </button>
                  <button onClick={toggleTheme} className="button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">{theme === 'light' ? 'Темна тема' : 'Світла тема'}</button>
                  <button onClick={() => { setCurrentPage('profile'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition"><FiUser /> <span>Особистий кабінет</span></button>
                  <button onClick={handleLogout} className="flex items-center space-x-2 bg-error text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"><FiLogOut /> <span>Вийти</span></button>
                </motion.div>
              )}
            </AnimatePresence>
          </header>
          {error && <p className="text-error mb-4">{error}</p>}
          <div className="w-full max-w-md bg-cardBackground rounded-lg shadow-lg p-6 mx-auto">
            <h2 className="text-2xl font-bold text-textPrimary mb-6 text-center">Редагувати профіль</h2>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 mb-4 border rounded-lg" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Новий пароль" className="w-full p-3 mb-4 border rounded-lg" />
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ім'я" className="w-full p-3 mb-4 border rounded-lg" />
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Прізвище" className="w-full p-3 mb-4 border rounded-lg" />
            <button onClick={handleUpdateProfile} className="w-full bg-primary text-white p-3 rounded-lg hover:bg-indigo-700 transition">Зберегти зміни</button>
          </div>
        </div>
      )}
      {currentPage === 'courses' && token && (
        <div className="w-full max-w-4xl flex flex-col min-h-screen">
          <header className="w-full mb-6">
            <div className="flex justify-between items-center">
              <div className="md:flex md:space-x-4 hidden">
                <button onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                  <FaHome /> <span>Головна сторінка</span>
                </button>
                <h1 className="header-title text-3xl font-bold">Курси</h1>
              </div>
              <div className="md:flex md:space-x-4 hidden">
                <button onClick={toggleTheme} className="button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">{theme === 'light' ? 'Темна тема' : 'Світла тема'}</button>
                <button onClick={() => { setCurrentPage('profile'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition"><FiUser /> <span>Особистий кабінет</span></button>
                <button onClick={handleLogout} className="flex items-center space-x-2 bg-error text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"><FiLogOut /> <span>Вийти</span></button>
              </div>
              <button onClick={toggleMenu} className="md:hidden text-2xl">
                {isMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="md:hidden flex flex-col space-y-2 mt-2"
                >
                  <button onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    <FaHome /> <span>Головна сторінка</span>
                  </button>
                  <h1 className="header-title text-3xl font-bold px-4">Курси</h1>
                  <button onClick={toggleTheme} className="button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition">{theme === 'light' ? 'Темна тема' : 'Світла тема'}</button>
                  <button onClick={() => { setCurrentPage('profile'); setIsMenuOpen(false); }} className="flex items-center space-x-2 button-gray px-4 py-2 rounded-lg hover:bg-gray-300 transition"><FiUser /> <span>Особистий кабінет</span></button>
                  <button onClick={handleLogout} className="flex items-center space-x-2 bg-error text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"><FiLogOut /> <span>Вийти</span></button>
                </motion.div>
              )}
            </AnimatePresence>
          </header>
          {error && <p className="text-error mb-4">{error}</p>}
          {loading ? (
            <div className="flex justify-center items-center">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="lesson-card rounded-lg shadow-md p-6 hover:shadow-lg transition flex flex-col">
                  <img
                    src={lessonData[lesson.id]?.image}
                    alt={lessonData[lesson.id]?.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                    onContextMenu={handleImageProtection}
                    onDragStart={handleImageProtection}
                  />
                  <div className="flex items-center space-x-2 mb-4">
                    {lesson.id === 1 && <FaGlobe className="text-primary" />}
                    {lesson.id === 2 && <FaCloudSun className="text-primary" />}
                    {lesson.id === 3 && <FaWater className="text-primary" />}
                    {lesson.id === 4 && <FaUsers className="text-primary" />}
                    <h2
                      className="lesson-title text-xl font-semibold cursor-pointer"
                      onClick={() => toggleLesson(lesson.id)}
                    >
                      {lessonData[lesson.id]?.title || lesson.title}
                    </h2>
                  </div>
                  <AnimatePresence>
                    {expandedLesson === lesson.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-auto max-h-48 mt-2"
                      >
                        <p className="text-textSecondary mb-4">{lessonData[lesson.id]?.theory}</p>
                        <button
                          onClick={() => startTest(lesson.id)}
                          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                          Пройти тест
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
          <div className="bg-cardBackground rounded-lg shadow-md p-6">
            <h2 className="results-header text-2xl font-semibold mb-4">Ваші результати</h2>
            {results.length > 0 ? (
              <table className="w-full text-left">
                <thead><tr className="border-b"><th className="p-3">Урок</th><th className="p-3">Оцінка (%)</th><th className="p-3">Дата</th></tr></thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{lessonData[result.lessonId]?.title || `Урок ${result.lessonId}`}</td>
                      <td className="p-3 flex items-center space-x-2">{result.score >= 60 ? <FaCheckCircle className="text-success" /> : <FaTimesCircle className="text-error" />} <span>{result.score.toFixed(2)}%</span></td>
                      <td className="p-3">{new Date(result.createdAt).toLocaleString('uk-UA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-textSecondary">Ви ще не проходили тести.</p>
            )}
          </div>
        </div>
      )}
      <AnimatePresence>
        {isModalOpen && currentLessonId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content rounded-lg p-6 w-full max-w-md relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2 text-textSecondary hover:text-textPrimary">✕</button>
              <h2 className="modal-text text-xl font-semibold mb-4">Тест для {lessonData[currentLessonId]?.title || `Урок ${currentLessonId}`}</h2>
              <p className="modal-text text-textSecondary mb-4">Питання {currentQuestionIndex + 1} із {questions[currentLessonId].length}</p>
              <p className="modal-question text-lg mb-4">{questions[currentLessonId][currentQuestionIndex].question}</p>
              <div className="space-y-2">
                {questions[currentLessonId][currentQuestionIndex].options.map((option, index) => (
                  <button key={index} onClick={() => handleAnswer(option)} className="modal-option w-full text-left p-3 border rounded-lg hover:bg-secondary transition">{option}</button>
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