const { ethers } = require("ethers");
const config = require("./config");

// 连接到结点
const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

// 创建钱包
const wallet = new ethers.Wallet(config.privateKey.trim(), provider);

// 转成16进制
const convertToHexa = (str = "") => {
  const res = [];
  const { length: len } = str;
  for (let n = 0, l = len; n < l; n++) {
    const hex = Number(str.charCodeAt(n)).toString(16);
    res.push(hex);
  }
  return `0x${res.join("")}`;
};

// 获取当前账户的 nonce
async function getCurrentNonce(wallet) {
  try {
    const nonce = await wallet.getTransactionCount("pending");
    console.log("Nonce:", nonce);
    return nonce;
  } catch (error) {
    console.error("Error fetching nonce:", error.message);
    throw error;
  }
}

// 获取当前主网 gas 价格
async function getGasPrice() {
  const gasPrice = await provider.getGasPrice();
  return gasPrice;
}

// 获取链上实时 gasLimit
async function getGasLimit(hexData, address) {
  const gasLimit = await provider.estimateGas({
    to: address,
    value: ethers.utils.parseEther("0"),
    data: hexData,
  });

  return gasLimit.toNumber();
}

// 增加重试逻辑
async function retryOperation(operation, retries = 3, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      if (error.code === "TIMEOUT" || error.code === "ECONNABORTED") {
        console.log(`请求超时，等待 ${delay}ms 后重试...`);
        // await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

async function sendTransaction(nonce, gasPrice) {
  const hexData = convertToHexa(config.tokenJson.trim());
  const address = await wallet.getAddress();
  const gasLimit = await getGasLimit(hexData, address);

  const transaction = {
    to: address,
    value: ethers.utils.parseEther("0"),
    data: hexData,
    nonce: nonce,
    gasPrice: gasPrice,
    gasLimit: gasLimit,
  };

  try {
    const tx = await retryOperation(
      async () => {
        return await wallet.sendTransaction(transaction);
      },
      3,
      100
    ); // 重试次数3次，每次重试间隔5000ms
    console.log(`Transaction with nonce ${nonce} hash:`, tx.hash);
  } catch (error) {
    if (error.code === "TIMEOUT" || error.code === -32000) {
      console.error(`Transaction with nonce ${nonce} timed out, retrying...`);
      // 在这里添加适当的重试逻辑或其他处理
    } else {
      console.error(`Error in transaction with nonce ${nonce}:`, error.message);
      // 处理其他类型的错误
    }
  }
}

// 转账交易
async function sendTransaction(nonce) {
  const hexData = convertToHexa(config.tokenJson.trim());
  // 获取实时 gasPrice
  const currentGasPrice = await getGasPrice();
  // 在当前 gasPrice 上增加 一定倍数
  const gasMultiple = parseInt(String(config.increaseGas * 100));
  const increasedGasPrice = currentGasPrice.div(100).mul(gasMultiple);
  // 获取钱包地址
  const address = await wallet.getAddress();
  // 获取当前 gasLimit 限制
  const gasLimit = await getGasLimit(hexData, address);

  const transaction = {
    to: address,
    // 替换为你要转账的金额
    value: ethers.utils.parseEther("0"),
    // 十六进制数据
    data: hexData,
    // 设置 nonce
    nonce: nonce,
    // 设置 gas 价格
    gasPrice: increasedGasPrice,
    // 限制gasLimit，根据当前网络转账的设置，不知道设置多少的去区块浏览器看别人转账成功的是多少
    gasLimit: gasLimit,
  };

  try {
    const tx = await wallet.sendTransaction(transaction);
    console.log(`Transaction with nonce ${nonce} hash:`, tx.hash);
  } catch (error) {
    console.error(`Error in transaction with nonce ${nonce}:`, error.message);
  }
}

// 发送多次交易
async function sendTransactions() {
  const currentNonce = await getCurrentNonce(wallet);
  const gasPrice = await getGasPrice();

  for (let i = 0; i < config.repeatCount; i++) {
    await sendTransaction(currentNonce + i, gasPrice);
  }
}

sendTransactions();
