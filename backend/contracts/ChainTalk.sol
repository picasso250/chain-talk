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
    
    // === 升级存储 (v0.2.0) ===
    // 使用预留存储槽添加新功能
    mapping(uint256 => uint256) private _replyCounts; // 每个主题的回复数量
    uint256 private _replyIdCounter; // 全局回复ID计数器
    uint256[48] private __gap; // 剩余48个槽位继续预留
    
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
        _replyIdCounter = 0; // v0.2.0 新增初始化
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
        _replyIdCounter++;
        _replyCounts[_topicId]++;
        emit ReplyCreated(_replyIdCounter, _topicId, msg.sender, block.timestamp, _content);
    }

    /**
     * @dev 获取当前主题ID计数器
     */
    function getTopicIdCounter() public view returns (uint256) {
        return _topicIdCounter;
    }

    /**
     * @dev 获取指定主题的回复数量 (v0.2.0 新增)
     * @param _topicId 主题ID
     */
    function getReplyCount(uint256 _topicId) public view returns (uint256) {
        return _replyCounts[_topicId];
    }

    /**
     * @dev 获取当前回复ID计数器 (v0.2.0 新增)
     */
    function getReplyIdCounter() public view returns (uint256) {
        return _replyIdCounter;
    }

    /**
     * @dev UUPS升级授权检查
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev 获取合约版本
     */
    function version() public pure returns (string memory) {
        return "0.2.0";
    }
}