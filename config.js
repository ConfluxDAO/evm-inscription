const config = {
    // 你想要打多少张，这里就设置多少，建议单次别超过 50，不然容易不上链
    repeatCount: 80000,

    // 在当前的 gas 基础上增加多少倍
    increaseGas: 1.3,

    // 你钱包的私钥
    privateKey: "",

    // 铭文json数据（替换成你想打的铭文json格式数据）
    tokenJson: 'data:,{"p":"cfxs-20","op":"mint","tick":"XFC","amt":"1"}',

    // RPC结点（兼容 evm 链都行）打哪条链就用哪条链的节点地址
    // eth =>  https://mainnet.infura.io/v3
    // arb => https://arb1.arbitrum.io/rpc
    // polygon => https://polygon-rpc.com
    // op => https://mainnet.optimism.io
    // linea => https://mainnet.infura.io/v3
    // scroll => https://rpc.scroll.io
    // zks => https://mainnet.era.zksync.io
    // bsc => https://bsc.publicnode.com
    rpcUrl: "https://emain-rpc.nftrainbow.cn/MSvtMQywfe"
}

module.exports = config
