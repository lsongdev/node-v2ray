#!/usr/bin/env node

const path = require('path');

const parse = (argv = process.argv.slice(2)) =>
  argv.reduce((args, value) => {
    if (value.startsWith('--')) {
      const m = value.match(/^--(\w+)(=(.+))?$/);
      const k = m[1];
      const v = m[3] ? m[3] : true;
      args[k] = v;
    } else {
      args._.push(value);
    }
    return args;
  }, {
    _: []
  });


const argv = parse();

const config = require(path.resolve(argv.config));

const protocolFormatter = {
  socks(bound) {
    const { listen, port, settings } = bound;
    console.log(' - listen:\t', `${listen}:${port}`);
    const { auth, accounts } = settings;
    if (auth === 'password') {
      accounts.forEach(account => {
        console.log(' - ', account);
      });
    }
  },
  vmess(bound) {
    const { settings, streamSettings } = bound;
    settings.vnext.forEach(server => {
      const { address, port, users } = server;
      console.log(' - address:\t', `${address}:${port}`);
      users.forEach(user => {
        console.log(' - id:\t\t', user.id);
        console.log(' - alterId:\t', user.alterId);
      });
    });
    if (streamSettings) {
      const { network, security, wsSettings } = streamSettings;
      console.log(' - network:\t', network);
      console.log(' - security:\t', security);
      if (network === 'ws') {
        console.log(' - path:\t', wsSettings.path);
      }
    }
  },
  shadowsocks(bound) {
    const { settings } = bound;
    settings.servers.forEach(server => {
      const { address, port, method, password } = server;
      console.log(' - address:\t', `${address}:${port}`);
      console.log(' - method:\t', method);
      console.log(' - password:\t', password);
    });
  }
};

const protocolPrinter = bound => {
  const { protocol } = bound;
  return protocolFormatter[protocol](bound);
};

const showInbounds = ({ inbounds, inbound }) => {
  console.log();
  console.log('== v2ray inbounds =='.toUpperCase());
  inbounds = inbounds || [inbound];
  inbounds.forEach((inbound, index) => {
    console.log();
    console.log('%s)', index + 1, inbound.protocol);
    protocolPrinter(inbound);
  });
};

const showOutbounds = ({ outbounds, outbound }) => {
  console.log();
  console.log('== v2ray outbounds =='.toUpperCase());
  outbounds = outbounds || [outbound];
  outbounds.forEach((outbound, index) => {
    console.log();
    console.log('%s)', index + 1, outbound.protocol);
    protocolPrinter(outbound);
  });
};

showInbounds(config);
showOutbounds(config);