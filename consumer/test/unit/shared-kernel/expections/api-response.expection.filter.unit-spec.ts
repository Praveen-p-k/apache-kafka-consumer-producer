import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from 'src/shared-kernel/exceptions/api-response.exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockLogger: any;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: 'test-url',
    };

    filter = new GlobalExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle HttpException', () => {
      const exception = new HttpException(
        'Test message',
        HttpStatus.BAD_REQUEST,
      );
      const host = createArgumentsHost(exception, mockResponse, mockRequest);

      // @ts-expect-error(TS2769)
      jest.replaceProperty(filter, 'logger', mockLogger);

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: mockRequest.url,
        message: 'Test message',
      });

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle non-string response', () => {
      const exception = new HttpException(
        { message: 'Test message object' },
        HttpStatus.BAD_REQUEST,
      );
      const host = createArgumentsHost(exception, mockResponse, mockRequest);

      // @ts-expect-error(TS2769)
      jest.replaceProperty(filter, 'logger', mockLogger);

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          path: mockRequest.url,
        }),
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle unknown exception', () => {
      const exception = new Error('Unknown error');
      const host = createArgumentsHost(exception, mockResponse, mockRequest);

      // @ts-expect-error(TS2769)
      jest.replaceProperty(filter, 'logger', mockLogger);

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: mockRequest.url,
        message: 'Unknown error',
      });
    });
  });

  function createArgumentsHost(
    _: any,
    response: any,
    request: any,
  ): ArgumentsHost {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ArgumentsHost;
  }
});
