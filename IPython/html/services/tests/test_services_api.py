"""Test the all of the services API."""


import os
import sys
import json
import urllib
from zmq.utils import jsonapi

import requests

from IPython.html.tests.launchnotebook import NotebookTestBase

class APITest(NotebookTestBase):
    """Test the kernels web service API"""

    def base_url(self):
        return super(APITest,self).base_url()

    def notebooks_url(self):
        return self.base_url() + 'api/notebooks'

    def kernels_url(self):
        return self.base_url() + 'api/kernels'

    def sessions_url(self):
        return self.base_url() + 'api/sessions'

    def contents_url(self):
        return self.contents_url() + 'api/contents'

    def mknb(self, name='', path='/'):
        url = self.notebooks_url()+path+name
        return url, requests.post(url)

    def test_no_notebooks(self):
        url = self.notebooks_url()
        r = requests.get(url)
        self.assertEqual(r.json(), [])

    def test_root_notebook_handler(self):
        # POST a notebook and test the dict thats returned.
        url, nb = self.mknb()
        data = nb.json()
        assert isinstance(data, dict)
        assert data.has_key("name")
        assert data.has_key("path")
        self.assertEqual(data['name'], u'Untitled0.ipynb')
        self.assertEqual(data['path'], u'/')

        # GET list of notebooks in directory
        r = requests.get(url)
        assert isinstance(r.json(), list)
        assert isinstance(r.json()[0], dict)

        # GET on a notebook name
        url = self.notebooks_url() + '/Untitled0.ipynb'
        r = requests.get(url)
        assert isinstance(data, dict)
        self.assertEqual(r.json(), data)

        # PATCH (rename) request.
        new_name = {'name':'test.ipynb'}
        r = requests.patch(url, data=jsonapi.dumps(new_name))
        data = r.json()
        assert isinstance(data, dict)

        # make sure the patch worked
        new_url = self.notebooks_url() + '/test.ipynb'
        r = requests.get(new_url)
        assert isinstance(r.json(), dict)
        self.assertEqual(r.json(), data)

        # GET bad (old) notebook name 
        r = requests.get(url)
        self.assertEqual(r.status_code, 404)

        # POST notebooks to folders one and two levels down.
        os.makedirs(os.path.join(self.notebook_dir.name, 'foo'))
        os.makedirs(os.path.join(self.notebook_dir.name, 'foo','bar'))
        url, nb = self.mknb(path='/foo/')
        url2, nb2 = self.mknb(path='/foo/bar/')
        data = nb.json()
        data2 = nb2.json()
        assert isinstance(data, dict)
        assert isinstance(data2, dict)
        assert data.has_key("name")
        assert data.has_key("path")
        self.assertEqual(data['name'], u'Untitled0.ipynb')
        self.assertEqual(data['path'], u'/foo/')
        assert data2.has_key("name")
        assert data2.has_key("path")
        self.assertEqual(data2['name'], u'Untitled0.ipynb')
        self.assertEqual(data2['path'], u'/foo/bar/')
        
        # GET request on notebooks one and two levels down
