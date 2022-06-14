/*

index.js - hash table

The MIT License (MIT)

Copyright (c) 2013 Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

"use strict";

var assert = function() {
}
assert.ok = function(bool) {
    if (!bool) {
        throw new Error('assert ok')
    }
}

function uhf (prime, numberOfHashSlots) {
    var a = Math.floor(Math.random() * (prime));         // {0, 1, ..., p-1}
    var b = Math.floor(Math.random() * (prime - 1) + 1); // {1, 2, ..., p-1}
    return function (someKey) {
        return ((a * someKey + b) % prime) % numberOfHashSlots;
    };
};

var HashTable = function HashTable (options) {
    var self = this;
    options = options || {};

    var numberOfHashSlots = options.numberOfHashSlots || 13;
    var prime = options.prime || (Math.pow(2,52) - 47); // prime near max int
    // http://primes.utm.edu/lists/2small/0bit.html

    var array = new Array(numberOfHashSlots);
    var hashFunction = uhf(prime, numberOfHashSlots);

    self.insert = function insert (key, data) {
        assert.ok(data !== null && data !== undefined);
        var i = 0;
        var hash = hashFunction(key);
        var j = hash;
        while (i != numberOfHashSlots) {
            j = (hash + i) % numberOfHashSlots;
            if (array[j] === undefined || array[j].key == key) {
                array[j] = {key: key, data: data};
                return;
            } else if (array[j].data === undefined) {
                // found empty spot, insert data here but make sure we go
                // to the end of the linear probe to garbage collect ourselves
                // if the key was stored further down
                array[j] = {key: key, data: data};
                i++;
                while (array[j] !== undefined && i != numberOfHashSlots) {
                    j = (hash + i) % numberOfHashSlots;
                    if (array[j].key == key) {
                        array[j].data = undefined;
                        // since we always garbage collect ourselves, we only
                        // need to find ourselves once
                        return;
                    }
                    i++;
                }
            }
            i++;
        }
        throw new Error("hash table overflow");
    };

    self.delete = function (key) {
        var i = 0;
        var hash = hashFunction(key);
        var j = hash;
        while (array[j] !== undefined && i != numberOfHashSlots) {
            j = (hash + i) % numberOfHashSlots;
            if (array[j].key == key) {
                array[j].data = undefined;
                return;
            }
            i++;
        }
    };

    self.search = function search (key) {
        var i = 0;
        var hash = hashFunction(key);
        var j = hash;
        while (array[j] !== undefined && i != numberOfHashSlots) {
            j = (hash + i) % numberOfHashSlots;
            if (array[j].key == key) {
                return array[j].data;
            }
            i++;
        }
        return undefined;
    };
};