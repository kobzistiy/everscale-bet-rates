pragma ever-solidity >= 0.62.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import './lib/flatqube/interfaces/IDexPair.sol';

import './access/OwnableInternal.sol';
import './libraries/MsgFlag.sol';
import './libraries/Errors.sol';

contract Root is OwnableInternal {

    uint16 static _nonce;

    // errors
    
    // constants
    uint128 constant BET_AMOUNT = 10 ever;
    uint128 constant TIMEOUT_FOR_ROUND = 43200; //12 hours in seconds
    uint128 constant LOCK_BEFORE_ROUND_END = 3600; //1 hour in seconds

    uint128 constant DEPLOY_VALUE = 5.0 ever;
    uint128 constant CALLBACK_VALUE = 0.1 ever;

    //vars
    mapping(uint128 => address[]) public _userBets;
    
    uint128 public _nextRoundTimestamp;
    uint128 public _registeredFunds;
    
    bool _active;
    address _tokenRoot;
    address _pairRoot;

    event RoundComplated(uint128 rate, address[] winners, uint128 reward);
    event RoundError();

    constructor(
        address owner,
        address tokenRoot,
        address pairRoot
    ) OwnableInternal (
        owner
    ) public {
        require(address(this).balance > DEPLOY_VALUE);
        tvm.accept();

        _tokenRoot = tokenRoot;
        _pairRoot = pairRoot;
        _nextRoundTimestamp = now;
        _active = true;

    }

    function getUserBets() public view returns(
        mapping(uint128 => address[]) userBets
    ) {
        return (
            _userBets
        );
    }

    function getDetails() public view returns(
        address tokenRoot,
        address pairRoot,
        uint128 timestamp,
        uint128 endRound,
        uint128 endBidding,
        bool active
    ) {
        return (
            _tokenRoot,
            _pairRoot,
            now,
            _nextRoundTimestamp,
            _nextRoundTimestamp - LOCK_BEFORE_ROUND_END,
            _active
        );
    }

    onBounce(TvmSlice slice) external virtual {
        require(msg.sender == _pairRoot);
        tvm.accept();

        uint32 functionId = slice.decode(uint32);
        if (functionId == tvm.functionId(IDexPair.expectedExchange)) {
            for ((uint128 rate, address[] users) : _userBets) {
                for (address _address : users) {
                    cashOut(_address, BET_AMOUNT);
                }	           
                delete _userBets[rate];
            }
            emit RoundError();
            _registeredFunds = 0;
            _active = true;
        }
        
    }
////////// Root actions
    
    function bet(uint128 rate, address user) public {   
        require(msg.value > BET_AMOUNT + CALLBACK_VALUE, 1000);        
        require(now < _nextRoundTimestamp - LOCK_BEFORE_ROUND_END, 1010);        
        require(_active, 1020);        
        tvm.rawReserve(BET_AMOUNT, 4); 
        _registeredFunds += BET_AMOUNT;
        _userBets[rate].push(user);
        user.transfer({value: 0, flag: MsgFlag.ALL_NOT_RESERVED + MsgFlag.IGNORE_ERRORS, bounce: false});        
    }
    
    
    function completeRound() public {    
        require(now > _nextRoundTimestamp, 1010);        
        require(_active, 1020);        
        tvm.accept();
        
        if (!_userBets.empty()) {
            _active = false;
            IDexPair(_pairRoot).expectedExchange{
                value: CALLBACK_VALUE*2,
                flag: 1,
                bounce: true,
                callback: Root.onExpectedExchangeResp
            }(1 ton, _tokenRoot);               
        }           
        
        _nextRoundTimestamp = getNextRoundTimestamp();
    }

    function _completeRound(uint128 _rate) internal {    
        /// main logic
        
        if (!_userBets.empty()) {
            uint128 winnerRate;
            address[] winnerUsers;
            
            int128 _minDiff = 9223372036854775807; // max uint64
            for ((uint128 rate, address[] users) : _userBets) {
                int128 _diff = math.abs(int128(_rate) - int128(rate));
                if(_minDiff > _diff) {
                    _minDiff = _diff;
                    winnerRate = rate; 
                    winnerUsers = users;                   
                } 
                delete _userBets[rate];
            }
            uint128 rewardOwner = _registeredFunds / 10;
            uint128 rewardUsers = (_registeredFunds - rewardOwner) / uint128(winnerUsers.length);
            
            for (address _address : winnerUsers) {
                cashOut(_address, rewardUsers);
            }	           
            tvm.rawReserve(DEPLOY_VALUE, 0); 
            owner().transfer({value: 0, flag: MsgFlag.ALL_NOT_RESERVED + MsgFlag.IGNORE_ERRORS, bounce: false});        
            
            emit RoundComplated(_rate, winnerUsers, rewardUsers);
            
            _registeredFunds = 0;
            
        }
        
        _active = true;

    }

    function onExpectedExchangeResp(
        uint128 expected_amount,
        uint128 expected_fee
    ) external {
        require(msg.sender == _pairRoot);
        tvm.accept();
        _completeRound(expected_amount);
    } 
    
    function getNextRoundTimestamp() internal pure returns (uint128 rate) {    
        return (now / TIMEOUT_FOR_ROUND + 1) * TIMEOUT_FOR_ROUND;        
    }

    function cashOut(address user, uint128 amount) internal {    
        user.transfer({value: amount, flag: MsgFlag.IGNORE_ERRORS, bounce: false});        
    }

    function kill() public onlyOwner {    
        require(_userBets.empty(), 1000);
        selfdestruct(owner());        
    }
    
}
