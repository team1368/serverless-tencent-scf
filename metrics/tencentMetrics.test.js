'use strict';

const sinon           = require('sinon');
const TencentProvider = require('../provider/tencentProvider');
const Serverless      = require('../test/serverless');
const TencentMetrics   = require('./tencentMetrics');

describe('TencentMetrics', () => {
    let serverless;
    let options;
    let tencentMetrics;

    beforeEach(() => {
        serverless = new Serverless();
        options = {
            stage: 'dev',
            region: 'ap-guangzhou',
            function: 'test'
        };
        serverless.setProvider('tencent', new TencentProvider(serverless, options));
        tencentMetrics = new TencentMetrics(serverless, options);
    });

    describe('#constructor()', () => {
        it('should set the serverless instance', () => {
            tencentMetrics.serverless.should.equal(serverless);
        });

        it('should set options if provided', () => {
            tencentMetrics.options.should.equal(options);
        });

        it('should make the provider accessible', () => {
            tencentMetrics.provider.should.to.be.an.instanceof(TencentProvider);
        });

        describe('hooks', () => {
            let validateStub;
            let setDefaultsStub;
            let tencentMetricsStub;

            beforeEach(() => {
                validateStub = sinon.stub(tencentMetrics, 'validate')
                    .returns(Promise.resolve());
                setDefaultsStub = sinon.stub(tencentMetrics, 'setDefaults')
                    .returns(Promise.resolve());
                tencentMetricsStub = sinon.stub(tencentMetrics, 'metrics')
                    .returns(Promise.resolve());
            });

            afterEach(() => {
                tencentMetrics.validate.restore();
                tencentMetrics.setDefaults.restore();
                tencentMetrics.metrics.restore();
            });

            it('should run "before:metrics:metrics" promise chain', () => tencentMetrics
                .hooks['before:metrics:metrics']().then(() => {
                    validateStub.calledOnce.should.equal(true);
                    setDefaultsStub.calledAfter(validateStub).should.equal(true);
                }));

            it('should run "metrics:metrics" promise chain', () => tencentMetrics
                .hooks['metrics:metrics']().then(() => {
                    tencentMetricsStub.calledOnce.should.equal(true);
                }));
        });
    });
});