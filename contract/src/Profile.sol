// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract UserProfile {
    uint256 private userID_counter;
    struct Profile {
        uint256 userID;
        string username;
        string cid; 
        string role; //client, freelancer
        address userAddress;
    }

    event ProfileSet(address indexed user, string username, string cid);

    mapping(address userAddress => Profile) private _profiles;
    mapping(string username => address) private _usernameOwner;

    function setProfile(string calldata username, string calldata cid, string calldata role) external {
        require(bytes(username).length > 0, "Username required");
        require(bytes(cid).length > 0, "CID required");

        userID_counter++;
        uint256 userID = userID_counter;

        Profile storage existingProfile = _profiles[msg.sender];

        if (bytes(existingProfile.username).length == 0) {
            require(_usernameOwner[username] == address(0), "Username taken");
        } else {
            if (keccak256(bytes(existingProfile.username)) != keccak256(bytes(username))) {
                require(_usernameOwner[username] == address(0), "Username taken");

                delete _usernameOwner[existingProfile.username];
            }
        }

        _profiles[msg.sender] = Profile({
            userID: userID,
            username: username,
            cid: cid,
            role: role,
            userAddress: msg.sender
        });

        _usernameOwner[username] = msg.sender;

        emit ProfileSet(msg.sender, username, cid);
    }

    function getProfileByAddress(address user) external view returns (Profile memory userProfile) {
        return _profiles[user];
    }

    function getUserByUsername(string calldata username) external view returns (address) {
        return _usernameOwner[username];
    }
}
