var fs = require('fs');

Object.defineProperties(Uint8Array.prototype, {
    count: {
        value: function (query) {
            /*
               Counts number of occurrences of query in array, an integer >= 0
               Uses the javascript == notion of equality.
            */
            var count = 0;
            for (let i = 0; i < this.length; i++)
                if (this[i] == query)
                    count++;
            return count;
        },
        writable: true

    }
});

Number.prototype.toByteString = function (size) {
    var s = this.toString(2)
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

module.exports = {

    getFilesizeInBytes: function (filename) {
        const stats = fs.statSync(filename)
        const fileSizeInBytes = stats.size
        return fileSizeInBytes
    }

    , toBytes: function (str) { //convert binary string like "0010100110101010101" to bytes array
        return str.match(new RegExp('.{1,' + 8 + '}', 'g'));
    }

    , toObject: function (arr) {
        var rv = {};
        for (var i = 0; i < arr.length; ++i)
            rv[i] = arr[i];
        return rv;
    }

    , writeFileSync: function (path, buffer, permission) {

        permission = permission || 438; // 0666
        var fileDescriptor;

        try {
            fileDescriptor = fs.openSync(path, 'w', permission);
        } catch (e) {
            fs.chmodSync(path, permission);
            fileDescriptor = fs.openSync(path, 'w', permission);
        }

        if (fileDescriptor) {
            fs.writeSync(fileDescriptor, buffer, 0, buffer.length, 0);
            fs.closeSync(fileDescriptor);
        }
    }

    , findFirstIndex: function (array, searchValue) {
        var index = array.findIndex(x => x === searchValue);
        return index
    }


    , findLastIndex: function (array, searchValue) {
        var index = array.slice().reverse().findIndex(x => x === searchValue);
        var count = array.length - 1
        var finalIndex = index >= 0 ? count - index : index;
        return finalIndex;
    }

}