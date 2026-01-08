// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/**
 * @title OnChainDiary
 * @dev Arbitrum 上的反修正主义内容网络。
 *      没有“删除键”，没有“修改键”，只有不可篡改的历史。
 */
contract OnChainDiary {
    // 每一条记录都是一个永久的事件日志
    event EntryCreated(
        address indexed user, 
        uint256 timestamp, 
        string content
    );

    /**
     * @dev 写入一条不可篡改的公开内容
     * @param _content 明文内容
     */
    function writeEntry(string memory _content) public {
        emit EntryCreated(msg.sender, block.timestamp, _content);
    }
}
