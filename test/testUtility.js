const config = require('config');
const jwt = require('jsonwebtoken');
const path = require('path');
const mongoRestore = require('mongodb-restore');
const { ObjectID } = require('bson');
const { assert } = require('chai');

const assertThrowsAsync = async (fn, errorMessage) => {
  let f = () => {
    // empty function
  };
  try {
    await fn();
  } catch (e) {
    f = () => {
      throw e;
    };
  } finally {
    if (errorMessage) {
      assert.throw(f, errorMessage);
    } else {
      assert.throw(f);
    }
  }
};

const assertNotThrowsAsync = async fn => {
  let f = () => {
    // empty function
  };
  try {
    await fn();
  } catch (e) {
    f = () => {
      throw e;
    };
  } finally {
    assert.doesNotThrow(f);
  }
};

const testAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
const campaignAddress = '5fd3412e3e403d0c0f9e4463';

function getJwt(address = testAddress) {
  const authentication = config.get('authentication');
  const jwtData = authentication.jwt;
  const token = jwt.sign(
    {
      userId: address,
      aud: jwtData.audience,
    },
    authentication.secret,
    {
      algorithm: jwtData.algorithm,
      expiresIn: jwtData.expiresIn,
      issuer: jwtData.issuer,
      subject: jwtData.subject,
      header: jwtData.header,
    },
  );
  return `Bearer ${token}`;
}

function seedData() {
  return new Promise((resolve, reject) => {
    mongoRestore({
      uri: config.get('mongodb'), // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>/<dbdatabase>
      root: path.join(__dirname, '/db_seed_data/giveth'),
      parser: 'bson',
      callback: (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      },
    });
  });
}

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateHexNumber(len) {
  const hex = '0123456789abcdef';
  let output = '';
  /* eslint-disable no-plusplus */
  for (let i = 0; i < len; i++) {
    output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
}

function generateRandomEtheriumAddress() {
  return `0x${generateHexNumber(40)}`;
}

function generateRandomTransactionHash() {
  return `0x${generateHexNumber(62)}`;
}

const SAMPLE_DATA = {
  // the user in seed data has these values
  USER_ADDRESS: testAddress,
  USER_GIVER_ID: 1,

  SECOND_USER_ADDRESS: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
  MILESTONE_ID: '5fd3424c3e403d0c0f9e4487',
  CAMPAIGN_ID: campaignAddress,
  FAKE_USER_ADDRESS: generateRandomEtheriumAddress(),
  DAC_ID: '5fd339eaa5ffa2a6198ecd70',
  MILESTONE_STATUSES: {
    PROPOSED: 'Proposed',
    REJECTED: 'Rejected',
    PENDING: 'Pending',
    IN_PROGRESS: 'InProgress',
    NEEDS_REVIEW: 'NeedsReview',
    COMPLETED: 'Completed',
    CANCELED: 'Canceled',
    PAYING: 'Paying',
    PAID: 'Paid',
    FAILED: 'Failed',
    ARCHIVED: 'Archived',
  },
  DonationStatus: {
    PENDING: 'Pending',
    PAYING: 'Paying',
    PAID: 'Paid',
    TO_APPROVE: 'ToApprove',
    WAITING: 'Waiting',
    COMMITTED: 'Committed',
    CANCELED: 'Canceled',
    REJECTED: 'Rejected',
    FAILED: 'Failed',
  },
  EventStatus: {
    PENDING: 'Pending', // PENDING events were p/u by the ws subscription, but have yet to contain >= requiredConfirmations
    WAITING: 'Waiting', // WAITING events have been p/u by polling, have >= requiredConfirmations, & are ready to process
    PROCESSING: 'Processing',
    PROCESSED: 'Processed',
    FAILED: 'Failed',
  },
  CREATE_MILESTONE_DATA: {
    fullyFunded: false,
    mined: true,
    title: 'test-milestone',
    description: '<p>give money for god sake</p>',
    image: '',
    reviewerAddress: testAddress,
    dacId: 0,
    date: '2020-11-10T00:00:00.000Z',
    recipientAddress: '0x0000000000000000000000000000000000000000',
    pluginAddress: '0x0000000000000000000000000000000000000001',
    campaignId: campaignAddress,
    status: 'InProgress',
    items: [],
    token: {
      name: 'ANY_TOKEN',
      address: '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF',
      foreignAddress: '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF',
      symbol: 'ANY_TOKEN',
      decimals: '1',
    },
    owner: {
      address: testAddress,
      createdAt: '2018-08-22T00:34:52.691Z',
      updatedAt: '2020-10-22T00:16:39.775Z',
      email: 'test@giveth.io',
    },
    type: 'BridgedMilestone',
    maxAmount: null,
    txHash: '0x8b0abaa5f5d3cc87c3d52362ef147b8a0fd4ccb02757f5f48b6048aa2e9d86c0',
    proofItems: [],
    pendingRecipientAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    peopleCount: 3,
  },
  CREATE_CAMPAIGN_DATA: {
    title: 'Hello I;m new Campaign',
    projectId: 10,
    image: 'This should be image :))',
    mined: false,
    reviewerAddress: testAddress,
    ownerAddress: testAddress,
    status: 'Pending',
    txHash: generateRandomTransactionHash(),
    description: 'test description for campaign',
  },
  DacStatus: {
    ACTIVE: 'Active',
    PENDING: 'Pending',
    CANCELED: 'Canceled',
    FAILED: 'Failed',
  },
  CREATE_DAC_DATA: {
    title: 'test dac title',
    description: 'test dac description',
    status: 'Pending',
    txHash: generateRandomTransactionHash(),
    ownerAddress: testAddress,
  },
  CAMPAIGN_STATUSES: {
    ACTIVE: 'Active',
    PENDING: 'Pending',
    CANCELED: 'Canceled',
    FAILED: 'Failed',
  },
};

const generateRandomMongoId = () => {
  return new ObjectID();
};

function padWithZero(number, size) {
  let s = String(number);
  while (s.length < (size || 2)) {
    s = `0${s}`;
  }
  return s;
}

module.exports = {
  getJwt,
  seedData,
  SAMPLE_DATA,
  generateRandomMongoId,
  generateRandomEtheriumAddress,
  assertNotThrowsAsync,
  assertThrowsAsync,
  generateRandomNumber,
  generateRandomTransactionHash,
  padWithZero,
};
