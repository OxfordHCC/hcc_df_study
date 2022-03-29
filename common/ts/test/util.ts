import test from 'tape';

import { deepClone } from '../src/util';

test("deepClone", (t) => {
	const a = {
		"pNum1": 1,
		"pNum2": 0,
		"pNum3": -1,
		"pNum4": 231231312,
		"pStr": "some string",
		"pBool1": true,
		"pBool2": false,
		"oArr1": [1,2,3],
		"oArr2": [],
		"oArr3": ["cat", "dog", "whale"],
		"oArr4": [{
			"a": "faa",
			"b": "baa"
		}],
		"oObj1": {
			"oObj1pNum": 1231,
			"oObj1pArr": [1, 2, 3],
			"oObj1pObj": {
				"oObj1oObjoObj": {
					"aObj1oObjoObjpStr":"some string"
				}
			}
		},
		"oObj2": {}
	}

	// clone object and check the result is equal to the original
	const b = deepClone(a);
	t.deepEqual(a, b);

	// if we change a property, the objects should not be equal anymore
	a["oObj1"]["oObj1pNum"] = 0;
	t.notDeepEqual(a, b);
	
	t.end();
});


