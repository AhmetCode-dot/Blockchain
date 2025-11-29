require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    // Docker içindeki ağ adı 'ganache' olduğu için host olarak onu kullanıyoruz
    ganache: {
      url: "http://ganache:8545",
      chainId: 1337
    },
    // Yerel testler için
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    }
  }
};