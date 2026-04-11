export interface LotteryOption {
  message: string;
  amount: number;
}

export const lotteryList: LotteryOption[] = [
  { message: "You won a local beauty contest!", amount: 1000 },
  { message: "Inheritance tax refund.", amount: 2000 },
  { message: "Speeding fine.", amount: -1500 },
  { message: "Doctor's fees.", amount: -500 },
  { message: "Bank error in your favor!", amount: 2000 },
  { message: "Holiday fund matures.", amount: 1000 },
  { message: "Income tax refund.", amount: 2000 },
  { message: "It is your birthday!", amount: 1000 },
  { message: "Life insurance matures.", amount: 1000 },
  { message: "Pay hospital fees.", amount: -1000 },
  { message: "Pay school fees.", amount: -1500 },
  { message: "Receive consultancy fee.", amount: 2500 },
  { message: "You have won second prize in a beauty contest!", amount: 100 },
  { message: "You inherit cash.", amount: 1000 },
  { message: "Casino jackpot!", amount: 5000 },
  { message: "Bad night at the poker table.", amount: -2500 },
];

export function getRandomLottery(): LotteryOption {
  return lotteryList[Math.floor(Math.random() * lotteryList.length)];
}
