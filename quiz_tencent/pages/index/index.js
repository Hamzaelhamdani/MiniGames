// index.js - Quiz implementation
const TOTAL_QUESTIONS = 20

// Pool of ~50 general knowledge questions stored in frontend code
const QUESTIONS = [
  { q: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], a: 2 },
  { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], a: 1 },
  { q: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Leo Tolstoy'], a: 1 },
  { q: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], a: 3 },
  { q: 'In computing, what does "CPU" stand for?', options: ['Central Process Unit', 'Central Processing Unit', 'Computer Personal Unit', 'Control Processing Unit'], a: 1 },
  { q: 'Which element has the chemical symbol O?', options: ['Gold', 'Oxygen', 'Silver', 'Iron'], a: 1 },
  { q: 'How many continents are there?', options: ['5', '6', '7', '8'], a: 2 },
  { q: 'What is the boiling point of water at sea level in °C?', options: ['90', '100', '110', '120'], a: 1 },
  { q: 'Who painted the Mona Lisa?', options: ['Pablo Picasso', 'Leonardo da Vinci', 'Vincent van Gogh', 'Claude Monet'], a: 1 },
  { q: 'Which country hosts the city of Tokyo?', options: ['China', 'South Korea', 'Japan', 'Thailand'], a: 2 },
  { q: 'What is the chemical formula for table salt?', options: ['NaCl', 'KCl', 'H2O', 'CO2'], a: 0 },
  { q: 'Which instrument has keys, pedals and strings?', options: ['Guitar', 'Piano', 'Violin', 'Drum'], a: 1 },
  { q: 'Who discovered penicillin?', options: ['Alexander Fleming', 'Marie Curie', 'Isaac Newton', 'Albert Einstein'], a: 0 },
  { q: 'What currency is used in the United Kingdom?', options: ['Euro', 'Pound sterling', 'Dollar', 'Franc'], a: 1 },
  { q: 'Which gas do plants absorb from the atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], a: 2 },
  { q: 'What is the hardest natural substance?', options: ['Gold', 'Iron', 'Diamond', 'Granite'], a: 2 },
  { q: 'Which language has the most native speakers?', options: ['English', 'Spanish', 'Mandarin Chinese', 'Hindi'], a: 2 },
  { q: 'Which city is known as the Big Apple?', options: ['Los Angeles', 'Chicago', 'New York City', 'San Francisco'], a: 2 },
  { q: 'How many legs does a spider have?', options: ['6', '8', '10', '12'], a: 1 },
  { q: 'Who is the author of "1984"?', options: ['George Orwell', 'Aldous Huxley', 'J.K. Rowling', 'F. Scott Fitzgerald'], a: 0 },
  { q: 'Which country is the origin of the sport karate?', options: ['China', 'Japan', 'Korea', 'Thailand'], a: 1 },
  { q: 'What is H2O commonly known as?', options: ['Salt', 'Water', 'Oxygen', 'Hydrogen'], a: 1 },
  { q: 'Which organ pumps blood around the body?', options: ['Liver', 'Lungs', 'Heart', 'Kidney'], a: 2 },
  { q: 'Which metal is liquid at room temperature?', options: ['Mercury', 'Gold', 'Copper', 'Aluminium'], a: 0 },
  { q: 'Which month has 28 days every year?', options: ['February', 'February only in leap years', 'February and others', 'None'], a: 0 },
  { q: 'What is the tallest mountain in the world?', options: ['K2', 'Kangchenjunga', 'Mount Everest', 'Lhotse'], a: 2 },
  { q: 'Which scientist proposed the theory of relativity?', options: ['Nikola Tesla', 'Albert Einstein', 'Galileo Galilei', 'Marie Curie'], a: 1 },
  { q: 'What is the main ingredient in guacamole?', options: ['Tomato', 'Avocado', 'Onion', 'Pepper'], a: 1 },
  { q: 'Which animal is known as the king of the jungle?', options: ['Tiger', 'Lion', 'Elephant', 'Gorilla'], a: 1 },
  { q: 'Which continent is Egypt part of?', options: ['Asia', 'Europe', 'Africa', 'South America'], a: 2 },
  { q: 'What color are chloroplasts?', options: ['Red', 'Blue', 'Green', 'Yellow'], a: 2 },
  { q: 'Which company created the iPhone?', options: ['Google', 'Microsoft', 'Apple', 'Samsung'], a: 2 },
  { q: 'Which language is primarily spoken in Brazil?', options: ['Spanish', 'Portuguese', 'English', 'French'], a: 1 },
  { q: 'How many players are on a soccer team on the field?', options: ['9', '10', '11', '12'], a: 2 },
  { q: 'What is the square root of 81?', options: ['7', '8', '9', '10'], a: 2 },
  { q: 'Which planet has the most moons?', options: ['Earth', 'Mars', 'Jupiter', 'Mercury'], a: 2 },
  { q: 'What is the largest mammal?', options: ['Elephant', 'Blue whale', 'Giraffe', 'Hippopotamus'], a: 1 },
  { q: 'In which sport would you perform a slam dunk?', options: ['Football', 'Basketball', 'Tennis', 'Baseball'], a: 1 },
  { q: 'Which country gifted the Statue of Liberty to the USA?', options: ['Germany', 'Spain', 'France', 'Italy'], a: 2 },
  { q: 'What is the process by which plants make food?', options: ['Respiration', 'Photosynthesis', 'Fermentation', 'Transpiration'], a: 1 },
  { q: 'Which element is represented by the symbol Fe?', options: ['Fluorine', 'Iron', 'Francium', 'Fermium'], a: 1 },
  { q: 'What year did the first man land on the Moon?', options: ['1965', '1969', '1972', '1959'], a: 1 },
  { q: 'Which animal is known for changing colors to blend in?', options: ['Chameleon', 'Cheetah', 'Kangaroo', 'Panda'], a: 0 },
  { q: 'Which organ is primarily responsible for filtering blood?', options: ['Heart', 'Liver', 'Kidneys', 'Spleen'], a: 2 },
  { q: 'What is the capital city of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], a: 2 },
  { q: 'Which gas is most abundant in Earth\'s atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'], a: 1 },
  { q: 'What instrument measures temperature?', options: ['Barometer', 'Thermometer', 'Hygrometer', 'Ammeter'], a: 1 },
  { q: 'Which famous physicist developed laws of motion?', options: ['Albert Einstein', 'Isaac Newton', 'Niels Bohr', 'Galileo Galilei'], a: 1 },
  { q: 'Which sea creature has eight arms?', options: ['Squid', 'Octopus', 'Cuttlefish', 'Jellyfish'], a: 1 },
  { q: 'Which desert is the largest hot desert in the world?', options: ['Gobi', 'Sahara', 'Kalahari', 'Arabian'], a: 1 },
]

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

Page({
  data: {
    screen: 'start', // 'start' | 'quiz' | 'result'
    questions: [], // selected 20 questions for session
    currentIndex: 0,
    score: 0,
    total: TOTAL_QUESTIONS,
    isGood: false,
    resultMessage: '',
    resultAnim: '',
  },

  onLoad() { },

  startQuiz() {
    // pick randomized 20 questions from pool
    const pool = QUESTIONS.slice()
    shuffle(pool)
    const selected = pool.slice(0, TOTAL_QUESTIONS)
    this._locked = false
    this.setData({
      screen: 'quiz',
      questions: selected,
      currentIndex: 0,
      score: 0,
      total: TOTAL_QUESTIONS,
    })
  },

  chooseOption(e) {
    if (this._locked) return
    this._locked = true
    const idx = parseInt(e.currentTarget.dataset.index, 10)
    const { questions, currentIndex } = this.data
    const question = questions[currentIndex]
    let { score } = this.data
    if (idx === question.a) score += 1
    const nextIndex = currentIndex + 1
    if (nextIndex >= questions.length) {
      // finish
      // determine good/bad (threshold: 60% correct)
      const threshold = Math.ceil(questions.length * 0.6)
      const isGood = score >= threshold
      const resultMessage = isGood ? 'That was amazing! You really know your stuff.' : 'Nice try! Keep learning and come back soon.'
      // trigger animation class
      const resultAnim = isGood ? 'celebrate' : 'shake'
      this.setData({ score, isGood, resultMessage, resultAnim }, () => {
        this.setData({ screen: 'result' })
        // clear animation class after 2s so it can retrigger on restart
        setTimeout(() => this.setData({ resultAnim: '' }), 2000)
        this._locked = false
      })
    } else {
      // move to next question after brief feedback
      this.setData({ score, currentIndex: nextIndex }, () => {
        this._locked = false
      })
    }
  },

  restartQuiz() {
    this.setData({ resultAnim: '', isGood: false, resultMessage: '' })
    this.startQuiz()
  },
})
