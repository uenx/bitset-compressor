# bitset-compressor
## An experiment: trying to compress data taking advantage of bitsets distribution info
Current situation: fail to compress random data but acceptable compression ratio on text data.

Need ZPAQ (http://mattmahoney.net/dc/zpaq.html) installed

TODO: implement usable compressor/decompressor (for now output files are missing some header information for decompressing)

## Sample test:  
$ node ./test_compress_range.js ./data/test_data_1.bin

![screen_shot](https://github.com/uenx/bitset-compressor/blob/master/screenshot.png)
