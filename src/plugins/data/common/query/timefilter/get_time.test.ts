/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import moment from 'moment';
import sinon from 'sinon';
import { getTime, getAbsoluteTimeRange } from './get_time';

describe('get_time', () => {
  describe('getTime', () => {
    test('build range filter in iso format', () => {
      const clock = sinon.useFakeTimers(moment.utc([2000, 1, 1, 0, 0, 0, 0]).valueOf());

      const filter = getTime(
        {
          id: 'test',
          title: 'test',
          timeFieldName: 'date',
          fields: [
            {
              name: 'date',
              type: 'date',
              esTypes: ['date'],
              aggregatable: true,
              searchable: true,
              filterable: true,
            },
          ],
        } as any,
        { from: 'now-60y', to: 'now' }
      );
      expect(filter!.range.date).toEqual({
        gte: '1940-02-01T00:00:00.000Z',
        lte: '2000-02-01T00:00:00.000Z',
        format: 'strict_date_optional_time',
      });
      clock.restore();
    });

    test('build range filter for non-primary field', () => {
      const clock = sinon.useFakeTimers(moment.utc([2000, 1, 1, 0, 0, 0, 0]).valueOf());

      const filter = getTime(
        {
          id: 'test',
          title: 'test',
          timeFieldName: 'date',
          fields: [
            {
              name: 'date',
              type: 'date',
              esTypes: ['date'],
              aggregatable: true,
              searchable: true,
              filterable: true,
            },
            {
              name: 'myCustomDate',
              type: 'date',
              esTypes: ['date'],
              aggregatable: true,
              searchable: true,
              filterable: true,
            },
          ],
        } as any,
        { from: 'now-60y', to: 'now' },
        { fieldName: 'myCustomDate' }
      );
      expect(filter!.range.myCustomDate).toEqual({
        gte: '1940-02-01T00:00:00.000Z',
        lte: '2000-02-01T00:00:00.000Z',
        format: 'strict_date_optional_time',
      });
      clock.restore();
    });
  });
  describe('getAbsoluteTimeRange', () => {
    test('should forward absolute timerange as is', () => {
      const from = '2000-01-01T00:00:00.000Z';
      const to = '2000-02-01T00:00:00.000Z';
      expect(getAbsoluteTimeRange({ from, to })).toEqual({ from, to });
    });

    test('should convert relative to absolute', () => {
      const clock = sinon.useFakeTimers(moment.utc([2000, 1, 0, 0, 0, 0, 0]).valueOf());
      const from = '2000-01-01T00:00:00.000Z';
      const to = moment.utc(clock.now).toISOString();
      expect(getAbsoluteTimeRange({ from, to: 'now' })).toEqual({ from, to });
      clock.restore();
    });
  });
});
