import os
import psycopg2
from psycopg2.psycopg1 import connection
from contextlib import contextmanager
from itertools import cycle
import time
import uuid


class ConnectionDBInterface:
    """
    Interface for database connection
    """
    def get_cursor(self): pass


class PostgresDBConnection(ConnectionDBInterface):
    """
    Postgres cursor generation singleton class
    """
    __instance = None
    __init_done = False

    def __new__(cls, *args, **kwargs):
        if not PostgresDBConnection.__instance:
            PostgresDBConnection.__instance = object.__new__(PostgresDBConnection)
        return PostgresDBConnection.__instance

    def __init__(
            self,
            autocommit=False,
            host=os.environ.get('DB_HOST_STAT'),
            port=os.environ.get('DB_PORT_STAT'),
            database=os.environ.get('DB_NAME_STAT'),
            user=os.environ.get('DB_USER_STAT'),
            password=os.environ.get('DB_PASSWORD_STAT'),
            pool_size=3, app_name='statistics'):

        if not PostgresDBConnection.__init_done:
            self._autocommit = autocommit
            self._host = host
            self._port = port
            self._database = database
            self._user = user
            self._password = password
            self._pool_size = pool_size
            self._app_name = app_name
            self.__uuid = uuid.uuid4()
            self.connection_pool = self.__init_connection_pool()
            self.__connection_pool_next = cycle(self.connection_pool)
            self.__time_opened = time.time()
            PostgresDBConnection.__init_done = True

    def __init_connection_pool(self):
        """
        initialize connection pool for the instance of the class
        :return: pool
        """
        pool = []
        for _ in range(0, self._pool_size):
            conn = psycopg2.connect(
                database=self._database,
                user=self._user,
                password=self._password,
                host=self._host,
                port=self._port,
                application_name=self._app_name)
            conn.autocommit = self._autocommit
            pool.append(conn)
        return pool

    @contextmanager
    def get_conn(self, autocommit=False):
        conn = None
        try:
            conn = next(self.__connection_pool_next)  # type: connection
            if autocommit:
                conn.autocommit = autocommit
            yield conn
        except psycopg2.Error:
            if not autocommit and conn:
                conn.rollback()
        finally:
            if conn.closed:
                self.connection_pool.remove(conn)
                self.connection_pool.append(psycopg2.connect(
                    database=self._database,
                    user=self._user,
                    password=self._password,
                    host=self._host,
                    port=self._port,
                    application_name=self._app_name
                ))
            else:
                conn.commit()

    def get_uuid(self):
        return self.__uuid

    def __del__(self):
        for conn in self.connection_pool:
            conn.close()

    def close(self):
        for conn in self.connection_pool:
            conn.close()
