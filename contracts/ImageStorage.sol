// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ImageStorage {
    struct ImageData {
        string ipfsHash;
        uint256 timestamp;
        address uploader;
    }

    mapping(string => ImageData) public images; // Mapping of hash to ImageData

    event ImageStored(string ipfsHash, uint256 timestamp, address uploader);

    function storeImage(string memory _ipfsHash) public {
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS Hash");
        images[_ipfsHash] = ImageData(_ipfsHash, block.timestamp, msg.sender);
        emit ImageStored(_ipfsHash, block.timestamp, msg.sender);
    }

    function getImage(string memory _ipfsHash) public view returns (ImageData memory) {
        return images[_ipfsHash];
    }
}
