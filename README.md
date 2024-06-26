# @sgtpooki/helia-verified-fetch-cli

`@sgtpooki/helia-verified-fetch-cli` is a command-line interface tool designed to facilitate the download and fetching of content using the javascript IPFS implementation,  [Helia](https://github.com/ipfs/helia), and [`@helia/verified-fetch`](https://github.com/ipfs/helia-verified-fetch/tree/main/packages/verified-fetch). It leverages various block brokers such as bitswap and trustless gateways to ensure secure and efficient data retrieval.

## Installation

To install `@sgtpooki/helia-verified-fetch-cli`, you need to have Node.js installed on your system. With Node.js installed, run the following command:

```sh
npm install -g @sgtpooki/helia-verified-fetch-cli
```

## Usage
After installation, you can use the CLI tool by invoking it with the desired resource URL and additional options as needed.

## Basic Usage
To fetch a resource, simply provide the resource URL as follows:

`helia-verified-fetch-cli <resource-url>`

### "Hello world" example

This example shows how you can fetch a "hello world" CID from peers using bitswap. (note that `-t false` is disabling trustless gateway usage)

```
helia-verified-fetch-cli ipfs://bafkqaddimvwgy3zao5xxe3debi --debug 'helia*,helia*:trace' --data ~/tmp/hvf-data -t false
```

### XKCD image example

```
helia-verified-fetch-cli 'ipfs://QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5MWcKMKxDu7RgQm/1 - Barrel - Part 1/1 - Barrel - Part 1.png' --data ~/tmp/hvf-data > file.png && open file.png
```

## Options

- `--data, -d`: Specify the directory to persist data/blockstore. By default, data is stored in-memory and will not persist between requests.
- `--use-bitswap, -b`: Use bitswap block broker. Enabled by default.
- `--use-trustless-gateways, -t`: Use trustless gateways. Enabled by default.
- `--trustless-gateways`: Provide a list of trustless gateways to use. Defaults to Helia default trustless gateways.
- `--accept, -a`: Set the Accept header for the request.
- `--verbose, -v`: Enable verbose logging, similar to setting DEBUG="helia*" in your environment variables.
- `--debug`: Set the DEBUG environment variable to the provided value.

## Callouts

- Currently, piping json to `jq` will fail with `jq: parse error: Unfinished JSON term at EOF at line 2129, column 7`. If you write to a file and then pipe to `jq`, it will work as expected.
