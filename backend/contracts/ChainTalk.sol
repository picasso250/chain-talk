// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;


/**
 * @title ChainTalk
 * @dev 链上极简论坛 - 永恒对话，链上留声
 *      没有删除键，没有修改键，只有不可篡改的讨论
 *      不可升级，无管理员权限
 *      版本: 1.0.0
 */
contract ChainTalk {
    // 主题ID计数器
    uint256 private _topicIdCounter;
    
    mapping(uint256 => uint256) private _replyCounts; // 每个主题的回复数量
    uint256 private _replyIdCounter; // 全局回复ID计数器
    
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
     * @dev 创建一个新的讨论主题
     * @param _content 主题内容
     */
    function createTopic(string memory _content) public {
        require(bytes(_content).length > 0, "Content cannot be empty");
        _topicIdCounter++;
        emit TopicCreated(_topicIdCounter, msg.sender, block.timestamp, _content);
    }

    /**
     * @dev 回复一个讨论主题
     * @param _topicId 主题ID
     * @param _content 回复内容
     */
    function createReply(uint256 _topicId, string memory _content) public {
        require(_topicId > 0 && _topicId <= _topicIdCounter, "Topic does not exist");
        require(bytes(_content).length > 0, "Content cannot be empty");
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
     * @dev 获取指定主题的回复数量
     * @param _topicId 主题ID
     */
    function getReplyCount(uint256 _topicId) public view returns (uint256) {
        return _replyCounts[_topicId];
    }

    /**
     * @dev 获取当前回复ID计数器
     */
    function getReplyIdCounter() public view returns (uint256) {
        return _replyIdCounter;
    }


    /**
     * @dev 获取合约版本
     */
    function version() public pure returns (string memory) {
        return "1.0.0";
    }
}
