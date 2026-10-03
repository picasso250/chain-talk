// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

/// @notice Immutable discussion log. replyTo == 0 starts a topic.
contract ChainTalk {
    uint256 private _postIdCounter;

    event Posted(
        uint256 indexed id,
        uint256 indexed replyTo,
        address indexed author,
        uint256 timestamp,
        string content
    );

    function post(string calldata content, uint256 replyTo) external {
        require(bytes(content).length > 0, "Content cannot be empty");
        require(replyTo <= _postIdCounter, "Post does not exist");
        _postIdCounter++;
        emit Posted(_postIdCounter, replyTo, msg.sender, block.timestamp, content);
    }
}
