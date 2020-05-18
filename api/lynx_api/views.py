from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser

from .models import SMJob
from .serializers import SMJobSerializer
from .job_manager import SMJobManager
from .actions import execute_workflow, complete_iteration, save_model, apply_model

import py_cdrive_api

import os, requests, string, random, threading, logging, shutil, tarfile

class Specs(APIView):
    parser_class = (JSONParser,)

    def get(self, request):
        data = {
            'clientId': os.environ['COLUMBUS_CLIENT_ID'],
            'authUrl': os.environ['AUTHENTICATION_URL'],
            'cdriveUrl': os.environ['CDRIVE_URL'],
            'cdriveApiUrl': os.environ['CDRIVE_API_URL'],
            'username': os.environ['COLUMBUS_USERNAME'],
            'appName': os.environ['APP_NAME'],
            'appUrl': os.environ['APP_URL']
        }
        return Response(data, status=status.HTTP_200_OK)

class AuthenticationToken(APIView):
    parser_class = (JSONParser,)

    @csrf_exempt
    def post(self, request, format=None):
        code = request.data['code']
        redirect_uri = request.data['redirect_uri']
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': os.environ['COLUMBUS_CLIENT_ID'],
            'client_secret': os.environ['COLUMBUS_CLIENT_SECRET']
        }
        response = requests.post(url=os.environ['AUTHENTICATION_URL'] + 'o/token/', data=data)

        return Response(response.json(), status=response.status_code)

class ExecuteWorkflow(APIView):
    parser_class = (JSONParser,)

    @csrf_exempt
    def post(self, request):
        auth_header = request.META['HTTP_AUTHORIZATION']
        token = auth_header.split()[1]

        uid = ''.join(random.choices(string.ascii_lowercase + string.digits,k=10))
        sm_job = SMJob(uid=uid, job_name=request.data['jobName'], stage="Profiling", status="Running", long_status="Initializing")
        sm_job.save()

        t = threading.Thread(target=execute_workflow, args=(uid, auth_header, request.data))
        t.start()

        return Response({'uid':uid}, status=status.HTTP_200_OK)

class WorkflowStatus(APIView):
    parser_class = (JSONParser,)

    def get(self, request):
        uid = request.query_params['uid']
        sm_job = SMJob.objects.filter(uid=uid)[0]
        return Response(SMJobSerializer(sm_job).data, status=status.HTTP_200_OK)

class CompleteIteration(APIView):
    parser_class = (JSONParser,)

    def post(self, request):
        uid = request.data['retId']
        return Response({'redirectUrl': complete_iteration(uid)}, status=status.HTTP_200_OK)

class ListJobs(APIView):
    parser_class = (JSONParser,)

    def get(self, request):
       return Response(SMJobSerializer(SMJob.objects.all(), many=True).data, status=status.HTTP_200_OK)

class SaveModel(APIView):
    parser_class = (JSONParser,)

    def post(self, request):
        uid = request.data['uid']
        save_model(uid)
        return Response(status=status.HTTP_200_OK)

class ApplyModel(APIView):
    parser_class = (JSONParser,)

    def post(self, request):
        uid = request.data['uid']
        apply_model(uid)
        return Response(status=status.HTTP_200_OK)

class DeleteJob(APIView):
    parser_class = (JSONParser,)

    def post(self, request):
        uid = request.data['uid']
        SMJob.objects.filter(uid=uid).delete()
        return Response(status=status.HTTP_200_OK)

class CreateImageContext(APIView):
    parser_class = (JSONParser,)

    def post(self, request):
        auth_header = request.META['HTTP_AUTHORIZATION']
        token = auth_header.split()[1]
        client = py_cdrive_api.CDriveClient(access_token=token)

        context_name = request.data['contextName']
        context_path = request.data['context']
        process_path = request.data['processFunction']
        requirements_path = None
        if 'requirements' in request.data:
            requirements_path = request.data['requirements']
        packages_path = None
        if 'packages' in request.data:
            packages_path = request.data['packages']
        modules_path = None
        if 'modules' in request.data:
            modules_path = request.data['modules']

        base_path = settings.BUILD_CONTEXTS_PATH + '/' + context_name
        if os.path.exists(base_path):
            shutil.rmtree(base_path)
        shutil.copytree(settings.BUILD_CONTEXTS_PATH + '/template', base_path)

        client.download(process_path, local_path=base_path + '/src/process')

        if requirements_path is not None:
            requirements_url = client.download(requirements_path)
            response = requests.get(requirements_url)
            with open(base_path + '/requirements.txt', 'a') as f:
                f.write(response.text)

        if packages_path is not None:
            client.download(packages_path, local_path = base_path + '/src')

        if modules_path is not None:
            client.download(modules_path, local_path = base_path + '/src/process')

        with tarfile.open(base_path + '.tar.gz', 'w:gz') as tar:
            for item in os.listdir(base_path):
                tar.add(base_path + '/' + item, arcname=item)

        client.upload(base_path + '.tar.gz', context_path)

        return Response(status=status.HTTP_200_OK)
