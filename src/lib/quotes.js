export const QUOTES = [
  {
    text: "You don't have to be perfect to be worthy of rest.",
    author: "Unknown",
  },
  { text: "Progress, not perfection.", author: "Unknown" },
  {
    text: "Your mental health is a priority. Your happiness is essential.",
    author: "Unknown",
  },
  {
    text: "It's okay to not be okay — as long as you don't give up.",
    author: "Unknown",
  },
  { text: "Small steps every day lead to big changes.", author: "Unknown" },
  {
    text: "Be gentle with yourself. You are a child of the universe.",
    author: "Max Ehrmann",
  },
  {
    text: "You are allowed to be both a masterpiece and a work in progress.",
    author: "Sophia Bush",
  },
  {
    text: "Difficult roads often lead to beautiful destinations.",
    author: "Unknown",
  },
  {
    text: "Breathe. You've survived 100% of your worst days.",
    author: "Unknown",
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  { text: "You are stronger than you think.", author: "Unknown" },
  { text: "Every expert was once a beginner.", author: "Unknown" },
  { text: "One day at a time. One step at a time.", author: "Unknown" },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    text: "Don't compare your chapter 1 to someone else's chapter 20.",
    author: "Unknown",
  },
  { text: "The only way out is through.", author: "Robert Frost" },
  {
    text: "Rest when you're weary. Refresh and renew yourself.",
    author: "Unknown",
  },
  { text: "You've come too far to only come this far.", author: "Unknown" },
  {
    text: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    text: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe",
  },
  {
    text: "You don't have to see the whole staircase, just take the first step.",
    author: "Martin Luther King Jr.",
  },
  {
    text: "Caring for yourself is not self-indulgence, it is self-preservation.",
    author: "Audre Lorde",
  },
  {
    text: "Almost everything will work again if you unplug it for a few minutes — including you.",
    author: "Anne Lamott",
  },
  {
    text: "There is hope, even when your brain tells you there isn't.",
    author: "John Green",
  },
  { text: "You are not your grades.", author: "Unknown" },
  {
    text: "Asking for help is a sign of strength, not weakness.",
    author: "Unknown",
  },
  {
    text: "The time you enjoy wasting is not wasted time.",
    author: "Bertrand Russell",
  },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  {
    text: "What you get by achieving your goals is not as important as what you become.",
    author: "Zig Ziglar",
  },
];

// export function getDailyQuote() {
//   const day = new Date().getDate() + new Date().getMonth() * 31;
//   return QUOTES[day % QUOTES.length];
// }

export function getDailyQuotes() {
  const day = new Date().getDate() + new Date().getMonth() * 31;
  const first = day % QUOTES.length;
  const second = (first + 7) % QUOTES.length;
  const third = (first + 14) % QUOTES.length;
  return [QUOTES[first], QUOTES[second], QUOTES[third]];
}
