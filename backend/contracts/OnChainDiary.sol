// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/**
 * @title ChainTalk
 * @dev 链上极简论坛 - 永恒对话，链上留声
 *      没有删除键，没有修改键，只有不可篡改的讨论
 */
contract ChainTalk {
    // 主题ID计数器
    uint256 private _topicIdCounter;
    uint256 private _replyIdCounter;
    
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
        emit ReplyCreated(_replyIdCounter, _topicId, msg.sender, block.timestamp, _content);
    }
}
