// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {UserProfile} from "../src/Profile.sol";

contract ProfileTest is Test{
    UserProfile profile;
    address john = address(0);
    address jake = address(1);


    function setUp() public {
        profile = new UserProfile();
    }

    function testGetProfileByAddress() public {
        vm.startPrank(john);
        profile.setProfile({
            username: "john",
            cid: "bafy....foldCid",
            role: UserProfile.Role.Client
        });
        vm.stopPrank();

        vm.startPrank(jake);
        profile.setProfile({
            username: "jake",
            cid: "bafy....foldCid",
            role: UserProfile.Role.Freelancer
        });
        vm.stopPrank();

        UserProfile.Profile memory johnProfile = profile.getProfileByAddress(john);
        UserProfile.Profile memory jakeProfile = profile.getProfileByAddress(jake);

        assertEq(johnProfile.username, "john");
        assertEq(johnProfile.cid, "bafy....foldCid");
        assertEq(uint8(johnProfile.role), uint8(UserProfile.Role.Client));
        assertEq(johnProfile.userAddress, john);

        //Jake
        assertEq(jakeProfile.username, "jake");
        assertEq(jakeProfile.cid, "bafy....foldCid");
        assertEq(uint8(jakeProfile.role), uint8(UserProfile.Role.Freelancer));
        assertEq(jakeProfile.userAddress, jake);

    }

    function testGetUserAddressByUsername() public {
        vm.startPrank(john);
        profile.setProfile({
            username: "john",
            cid: "bafy....foldCid",
            role: UserProfile.Role.Client 
        });
        vm.stopPrank();
        assertEq(profile.getUserByUsername("john"), john);
    }
}
