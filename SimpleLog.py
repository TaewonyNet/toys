import os
import logging
import logging.handlers
import sys
import datetime

class SimpleLog:
    def __init__(self, filename):
        if (os.environ.get('SetLog') == None):
            os.environ['SetLog'] = 'SetLog'

            class StreamToLogger(object):
                """
                Fake file-like stream object that redirects writes to a logger instance.
                """
                def __init__(self, outstream, filename, log_level=logging.INFO):
                    if not filename:
#                         %%javascript
#                         var kernel = IPython.notebook.kernel;
#                         var body = document.body,  
#                             attribs = body.attributes;
#                         var command = "filename = " + "'"+attribs['data-notebook-name'].value+"'";
#                         kernel.execute(command);
                        filename = os.path.basename(__file__)+'.log'
                        print('filename:', filename)
                        
                    self.filename = filename
                    self.outstream = outstream
                    if log_level == logging.INFO:
                        self.log_level = 'INFO'
                    elif log_level == logging.DEBUG:
                        self.log_level = 'DEBUG'
                    elif log_level == logging.WARNING:
                        self.log_level = 'WARNING'
                    elif log_level == logging.ERROR:
                        self.log_level = 'ERROR'
                    elif log_level == logging.CRITICAL:
                        self.log_level = 'CRITICAL'
                    

                def write(self, buf):
                    with open(self.filename,'a', encoding = "UTF-8") as f:
                        for line in buf.rstrip().splitlines():
                            f.write('[%s] %s > %s\n' % (self.log_level, datetime.datetime.now(), line.rstrip()))
                    self.outstream.write(buf)

                def flush(self):
                    return
            sys.stdout = StreamToLogger(sys.stdout, filename, log_level=logging.INFO)
            sys.stderr = StreamToLogger(sys.stderr, filename, log_level=logging.ERROR)
    
class SimpleLog2:
    def __init__(self, filename, loglevel):
        if (os.environ.get('NODE_ENV') == None):
            os.environ['NODE_ENV'] = 'SetLog'
            
            class StreamToLogger(object):
                """
                Fake file-like stream object that redirects writes to a logger instance.
                """
                def __init__(self, logger, outStream, log_level=logging.INFO):
                    self.logger = logger
                    self.log_level = log_level
                    self.linebuf = ''
                    self.outStream = outStream

                def write(self, buf):
                    self.outStream.write(buf)
                    for line in buf.rstrip().splitlines():
                        self.logger.log(self.log_level, line.rstrip())

                def flush(self):
                    return
            
            if (loglevel == 'DEBUG'):
                loggerLevel = logging.DEBUG
            elif(loglevel == 'INFO'):
                loggerLevel = logging.INFO
            else:
                loggerLevel = logging.DEBUG
                
            self.orig_stdout = sys.stdout
            self.orig_stderr = sys.stderr

            self.outlogger = logging.getLogger('fileoutlogger')

            fomatter = logging.Formatter('[%(levelname)s|%(filename)s:%(lineno)s] %(asctime)s > %(message)s')

            # 스트림과 파일로 로그를 출력하는 핸들러를 각각 만든다.
            fileHandler = logging.FileHandler(filename, encoding = "UTF-8")

            # 각 핸들러에 포매터를 지정한다.
            fileHandler.setFormatter(fomatter)

            # 로거 인스턴스에 스트림 핸들러와 파일핸들러를 붙인다.
            self.outlogger.addHandler(fileHandler)
            self.outlogger.setLevel(loggerLevel)

            sys.stdout = StreamToLogger(self.outlogger, self.orig_stdout, logging.INFO)
            sys.stderr = StreamToLogger(self.outlogger, self.orig_stderr, logging.ERROR)
        return