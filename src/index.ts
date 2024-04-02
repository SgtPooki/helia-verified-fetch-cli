#!/usr/bin/env node
import { bitswap, trustlessGateway } from '@helia/block-brokers'
import { createVerifiedFetch, type VerifiedFetchInit } from '@helia/verified-fetch'
import { FsBlockstore } from 'blockstore-fs'
import { FsDatastore } from 'datastore-fs'
import debug from 'debug'
import { createHelia, type BlockBroker, type HeliaInit } from 'helia'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'
import { contentTypeParser } from './content-type-parser.js'

// TODO: fix top level await issue with esbuild
void yargs(hideBin(process.argv))
  .command('$0 [resource]', 'download and fetch content using Helia and @helia/verified-fetch', (yargs) => {
    return yargs
      .positional('resource', {
        describe: 'Resource url to download. See https://github.com/ipfs/helia-verified-fetch/tree/main/packages/verified-fetch for details on supported URLs.',
        required: true,
        type: 'string'
      })
      .option('data', {
        alias: 'd',
        type: 'string',
        string: true,
        description: 'Where to persist data/blockstore. Defaults to in-memory only (data will not persist between requests)'
      })
      .option('use-bitswap', {
        alias: 'b',
        type: 'boolean',
        default: true
      })
      .option('use-trustless-gateways', {
        alias: 't',
        type: 'boolean',
        default: true
      })
      .option('trustless-gateways', {
        type: 'array',
        string: true,
        requiresArg: true,
        default: [],
        description: 'List of trustless gateways to use. Defaults to a list of known trustless gateways.'
      })
      .option('accept', {
        alias: 'a',
        type: 'string',
        description: 'Accept header to send with the request'
      })
      .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging. Similiar to setting DEBUG="helia*" environment variable.'
      })
      .option('debug', {
        type: 'string',
        description: 'Explicitly set DEBUG to the value provided by this option.'
      })
  }, async (argv) => {
    if (argv.resource == null) {
      throw new Error('Resource URL is required')
    }
    if (argv.debug != null) {
      debug.enable(argv.debug)
    } else if (argv.verbose === true) {
      debug.enable('helia:*')
    }
    const helia = await createHelia(getHeliaOptions(argv))
    const fetch = await createVerifiedFetch(helia, { contentTypeParser })
    const response = await fetch(argv.resource, getFetchOptions(argv))
    const contentType = response.headers.get('Content-Type')
    if (contentType != null) {
      if (contentType.includes('json')) {
        // TODO: fix pipeable json
        const json = await response.json()
        process.stdout.write(JSON.stringify(json, null, 2))
        process.exit(0)
      }
    }

    const bodyReader = response.body?.getReader()
    if (bodyReader == null) {
      throw new Error('Failed to get body reader')
    }
    while (true) {
      const { done, value } = await bodyReader.read()
      if (value != null) {
        process.stdout.write(value)
      }
      if (done) {
        break
      }
    }

    process.exit(0)
  })
  .help()
  .parse()

interface CliOptions {
  useBitswap: boolean
  useTrustlessGateways: boolean
  trustlessGateways: string[]
  accept?: string
  data?: string
}

function getHeliaOptions (argv: CliOptions): Partial<HeliaInit> {
  const heliaOptions: Partial<HeliaInit> = {}
  heliaOptions.blockBrokers = getBlockBrokers(argv)
  if (argv.data != null) {
    heliaOptions.blockstore = new FsBlockstore(argv.data)
    heliaOptions.datastore = new FsDatastore(argv.data)
  }

  return heliaOptions
}

function getBlockBrokers ({ useBitswap, useTrustlessGateways, trustlessGateways }: CliOptions): Array<(components: any) => BlockBroker> {
  const blockBrokers: Array<(components: any) => BlockBroker> = []
  if (useBitswap) {
    blockBrokers.push(bitswap())
  }
  if (useTrustlessGateways) {
    blockBrokers.push(trustlessGateway(trustlessGateways.length > 0 ? { gateways: trustlessGateways } : undefined))
  }

  return blockBrokers
}

function getFetchOptions (argv: { accept?: string }): VerifiedFetchInit {
  const options = {
    headers: new Headers()
  }
  if (argv.accept != null) {
    options.headers.set('Accept', argv.accept)
  }
  return options
}
