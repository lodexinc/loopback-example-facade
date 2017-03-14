var colors = require('colors');
var http = require('http');

checkHealth('localhost', 3000, '/vitals');

function checkHealth(host, port, path) {
  var httpOptions = {
    host: host,
    port: port,
    path: path,
    method: 'GET'
  }
  var req = http.request(httpOptions, function(response) {
    var str = '';
    response.on('data', function(chunk) {
      str = str + chunk;
    });
    response.on('end', function() {
      printHealth(JSON.parse(str));
    });
  });
  req.on('error', function(err) {
    console.log(err);
  });
  req.end();
}

const HPIPE = '──';
const BPIPE = '└';
const TPIPE = '├';
const COLORS = {
  healthy: 'green',
  unhealthy: 'red'
};

function printHealth(vitals) {
  console.log(` ├── ${'facade'.white} (${vitals.status.green})`);
  printDependencies(vitals.dependencies);
}

function printDependencies(dependencies, depth) {
  Object.keys(dependencies).forEach(function(name) {
    let info = dependencies[name];
    let prefix = '';
    let status = info.status[COLORS[info.status]];
    depth = depth || 1;

    for(let i = 0; i < depth; i++) {
      prefix = '| ' + prefix;
    }

    if (depth === 1) {
      prefix += '└──'
    } else {
      prefix += '├──'
    }    

    console.log(` ${prefix} ${name.white} (${status})`);
    if (info.dependencies) printDependencies(info.dependencies, depth + 1);
  });
}

const vitals = {
  status: 'healthy',
  dependencies: {
    accounts: {
      status: 'healthy',
      dependencies: {
        'accounts-redis': {
          status: 'healthy'
        },
        'accounts-db': {
          status: 'healthy'
        }
      }
    },
    transactions: {
      status: 'unhealthy',
      dependencies: {
        'shared-redis': {
          status: 'healthy'
        },
        'mongodb': {
          status: 'unhealthy'
        }
      }
    },
    customers: {
      status: 'healthy',
      meta: {
        memory: process.memoryUsage()
      },
      dependencies: {
        'shared-redis': {
          status: 'healthy'
        },
        internalService: {
          status: 'healthy'
        }
      }
    }
  }
};
