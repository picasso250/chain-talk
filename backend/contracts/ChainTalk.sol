// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title ChainTalk
 * @dev 链上极简论坛 - 永恒对话，链上留声
 *      没有删除键，没有修改键，只有不可篡改的讨论
 *      可升级版本 - 使用UUPS代理模式
 *      版本: 0.1.0 (清理版本)
 */
contract ChainTalk is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    // 主题ID计数器
    uint256 private _topicIdCounter;
    
    // === 预留存储槽 (v0.1.0) ===
    // 为未来升级预留的存储空间
    uint256[50] private __gap; // 预留50个槽位用于未来升级
    
    // 主题创建事件
    event TopicCreated(
        uint256 indexed topicId,
        address indexed author,
        uint256 timestamp,
        string content
    );
    
    // 回复创建事件
    event ReplyCreated(
        uint256 indexed replyId,
        uint256 indexed topicId,
        address indexed author,
        uint256 timestamp,
        string content
    );

    /**
     * @dev 合约初始化函数，替代构造函数
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        _topicIdCounter = 0;
    }

    /**
     * @dev 创建一个新的讨论主题
     * @param _content 主题内容
     */
    function createTopic(string memory _content) public {
        _topicIdCounter++;
        emit TopicCreated(_topicIdCounter, msg.sender, block.timestamp, _content);
    }

    /**
     * @dev 回复一个讨论主题
     * @param _topicId 主题ID
     * @param _content 回复内容
     */
    function createReply(uint256 _topicId, string memory _content) public {
        // 简单的回复ID生成策略：topicId * 1M + replyNumber
        // 后续升级可以改进为全局唯一ID
        uint256 replyId = _topicId * 1000000 + 1;
        emit ReplyCreated(replyId, _topicId, msg.sender, block.timestamp, _content);
    }

    /**
     * @dev 获取当前主题ID计数器
     */
    function getTopicIdCounter() public view returns (uint256) {
        return _topicIdCounter;
    }

    /**
     * @dev UUPS升级授权检查
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev 获取合约版本
     */
    function version() public pure returns (string memory) {
        return "0.1.0";
    }
}