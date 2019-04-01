import json
import logging
from django.views.generic import TemplateView, View
from django.db import DatabaseError
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from core.models import RemoteData
from core.tools import get_client_ip
from core.forms import UserForm, RemoteDataForm


logger = logging.getLogger()


class Index(TemplateView):

    template_name = 'index.html'


@method_decorator(csrf_exempt, name='dispatch')
class GetRemoteData(View):

    def post(self, request, *args, **kwargs):
        """
        Post request with data from users
        :param request: HttpRequest
        :param args:
        :param kwargs:
        :return:
        """
        if request.content_type != 'application/json':
            logger.warning('{}: {}:{}'.format(
                self.__class__.__name__, 'Got unexpected header', request.content_type)
            )
            return HttpResponse('Expecting \'application/json\' header')

        try:
            json_data = json.loads(request.body)
            # pg_conn_o = PostgresDBConnection(app_name='collector_StartSession')
            # with pg_conn_o.get_conn() as pg_conn:
            #     with pg_conn.cursor() as pg_cursor:
            #         query = """
            #           INSERT INTO
            #             statistics_schema.stats(ip, time_slots, device_cookie, user_obj) VALUES
            #             (%(ip)s, %(time_slots)s, %(device_cookie)s, %(user_obj)s)"""

        except json.JSONDecodeError as e:
            logger.error('{}: {}'.format(self.__class__.__name__, e))
            return JsonResponse({'status': 'error'}, status=400)

        try:
            user_obj = UserForm({
                'surname': json_data.get('surname'),
                'age': json_data.get('age'),
                'gender': json_data.get('gender'),
                'grade': json_data.get('grade'),
                'lefthanded': json_data.get('lefthanded'),
            })
            if user_obj.is_valid():
                user_obj.save()
            else:
                logger.error('{}: {}'.format(self.__class__.__name__, user_obj.errors))
                return JsonResponse({'status': 'error'}, status=400)

        except DatabaseError as e:
            logger.error('{}: {}'.format(self.__class__.__name__, e))
            return JsonResponse({'status': 'error'}, status=400)

        try:
            remote_obj = RemoteDataForm({
                'user': user_obj.instance.id,
                'ip': get_client_ip(request),
                'time_slots': json_data.get('time_slots'),
                'marker': json_data.get('marker'),
                'channel': json_data.get('channel'),
                'vm': json_data.get('vm'),
                'os': json_data.get('os'),
                'remote_tool': json_data.get('remote_tool'),
                'device': json_data.get('device'),
                'movements': json_data.get('movements')
            })
            if remote_obj.is_valid():
                remote_obj.save()
            else:
                logger.error('{}: {}'.format(self.__class__.__name__, remote_obj.errors))
                return JsonResponse({'status': 'error'}, status=400)

        except DatabaseError as e:
            logger.error('{}: {}'.format(self.__class__.__name__, e))
            return JsonResponse({'status': 'error'}, status=400)

        return JsonResponse({'status': 'ok', 'marker': json_data.get('marker')}, status=200)


class InvalidateResult(View):

    def post(self, request, *args, **kwargs):
        """
        Post request with data from users
        :param request: HttpRequest
        :param args:
        :param kwargs:
        :return:
        """
        if request.content_type != 'application/json':
            logger.warning('{}: {}:{}'.format(
                self.__class__.__name__, 'Got unexpected header', request.content_type)
            )
            return HttpResponse('Expecting \'application/json\' header')

        try:
            json_data = json.loads(request.body)

        except json.JSONDecodeError as e:
            logger.error('{}: {}'.format(self.__class__.__name__, e))
            return JsonResponse({'status': 'error'}, status=400)

        marker = json_data.get('marker')
        if not marker:
            logger.warning('{}: {}'.format(self.__class__.__name__, 'Marker parameter is expecting'))
            return JsonResponse({'status': 'error'}, status=400)

        record = RemoteData.objects.filter(marker=marker)
        if not record:
            logger.warning('{}: {}: {}'.format(self.__class__.__name__, 'Requested marker is', json_data.get('marker')))
            return JsonResponse({'status': 'error', 'data': 'Requested marker not found'}, status=400)

        target_obj = record[0]
        target_obj.is_ok = False
        target_obj.save()
        logger.info('{}: row with marker {} is set to False'.format(self.__class__.__name__, marker))
        return JsonResponse({'status': 'ok'}, status=200)
