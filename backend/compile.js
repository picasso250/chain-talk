const solc = require('solc');
const fs = require('fs');
const path = require('path');

const CONTRACT_FILE = 'ChainTalk.sol';
const CONTRACT_NAME = 'ChainTalk';
const SOURCE_DIR = path.join(__dirname, 'contracts');
const OUTPUT_DIR = path.join(__dirname, 'artifacts');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 读取源码
const sourcePath = path.join(SOURCE_DIR, CONTRACT_FILE);
const source = fs.readFileSync(sourcePath, 'utf8');

// 构造 solc 输入
const input = {
  language: 'Solidity',
  sources: {
    [CONTRACT_FILE]: { content: source }
  },
  settings: {
    evmVersion: 'paris',
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode', 'metadata']
      }
    },
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};

console.log('编译合约...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// 检查错误
if (output.errors) {
  const errors = output.errors.filter(e => e.severity === 'error');
  if (errors.length > 0) {
    console.error('编译错误:');
    errors.forEach(e => console.error(e.formattedMessage));
    process.exit(1);
  }
  output.errors.filter(e => e.severity === 'warning').forEach(w => {
    console.warn('警告:', w.formattedMessage);
  });
}

// 提取合约
const contract = output.contracts[CONTRACT_FILE][CONTRACT_NAME];

// 写入 artifact
const artifact = {
  contractName: CONTRACT_NAME,
  abi: contract.abi,
  bytecode: '0x' + contract.evm.bytecode.object,
  deployedBytecode: '0x' + contract.evm.deployedBytecode.object,
  metadata: contract.metadata,
  compiler: {
    version: JSON.parse(contract.metadata).compiler.version
  }
};

const outputPath = path.join(OUTPUT_DIR, `${CONTRACT_NAME}.json`);
fs.writeFileSync(outputPath, JSON.stringify(artifact, null, 2));

console.log('✅ 编译成功!');
console.log('   ABI 长度:', contract.abi.length, '个条目');
console.log('   Bytecode 长度:', contract.evm.bytecode.object.length, '字符');
console.log('   编译器版本:', JSON.parse(contract.metadata).compiler.version);
console.log('   输出:', outputPath);
