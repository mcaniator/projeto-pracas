#!/bin/bash

dir="$(pwd)/models"

text="'use strict';\nconst {\n Model\n} = require('sequelize');\nmodule.exports = (sequelize, DataTypes) => {\n"
entry="test.txt"
echo "$dir"
for entry in "$dir"/*; do
    line="$(head -n 1 $entry)"
    if [[ $line != "'use strict';" ]]; then
        echo "$entry"
        sed -i '1d' $entry
        sed -i "1s/^/$text/" "$entry"
        head -n -2 "$entry" | sponge "$entry"
        echo "return ;" >> "$entry"
        echo "};" >> "$entry"
    fi
done
