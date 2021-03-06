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

import React from 'react';
import { mountWithIntl } from '@kbn/test/jest';
import { ApplicationUsageContext, TrackApplicationView } from './track_application_view';
import { IApplicationUsageTracker } from '../../plugin';
import { fireEvent } from '@testing-library/react';

describe('TrackApplicationView', () => {
  test('it renders the internal component even when no tracker has been set', () => {
    const component = mountWithIntl(
      <TrackApplicationView viewId={'testView'}>
        <h1>Hello</h1>
      </TrackApplicationView>
    );
    component.unmount();
  });

  test('it tracks the component while it is rendered', () => {
    const applicationUsageTrackerMock: jest.Mocked<IApplicationUsageTracker> = {
      trackApplicationViewUsage: jest.fn(),
      flushTrackedView: jest.fn(),
      updateViewClickCounter: jest.fn(),
    };
    expect(applicationUsageTrackerMock.trackApplicationViewUsage).not.toHaveBeenCalled();
    const viewId = 'testView';
    const component = mountWithIntl(
      <ApplicationUsageContext.Provider value={applicationUsageTrackerMock}>
        <TrackApplicationView viewId={viewId}>
          <h1>Hello</h1>
        </TrackApplicationView>
      </ApplicationUsageContext.Provider>
    );
    expect(applicationUsageTrackerMock.trackApplicationViewUsage).toHaveBeenCalledWith(viewId);
    expect(applicationUsageTrackerMock.updateViewClickCounter).not.toHaveBeenCalled();
    fireEvent.click(component.getDOMNode());
    expect(applicationUsageTrackerMock.updateViewClickCounter).toHaveBeenCalledWith(viewId);
    expect(applicationUsageTrackerMock.flushTrackedView).not.toHaveBeenCalled();
    component.unmount();
    expect(applicationUsageTrackerMock.flushTrackedView).toHaveBeenCalledWith(viewId);
  });
});
