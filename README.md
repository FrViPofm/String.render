String.render is a javascript library that contains an extention to the
String.prototype. This extention allows you to render a string against
complex data structures.
The string, as template, is writtent in a Django-like style.
(see https://docs.djangoproject.com/en/dev/ref/templates/ )

The code is released under the Gnu Public licence version 3.
(see http://www.gnu.org/licenses/gpl.html )

# Example

    /* in a javascript code */
    var persons=[
        {"name":"McDonald","firstname":"JoHn","age":39},
        {"name":"angel","firstname":"michael","age":21},
        {"name":"Collins","firstname":"ANN","age":32}
    ]
    "<ul>{{ for person in persons|dictsort:"age" }}\
      <li class='hcard'>\
        <span class='firstname'>{{ person.name|lower|capfirst }}</span>\
        <span class='name'>{{ person.name|firstcap }}</span>\
      </li>\
    {% endfor %}</ul>".render({"persons":persons})

will render :

    <ul>
      <li class='hcard'>>
        <span class='firstname'>Micheal</span>
        <span class='name'>Angel</span>
      </li>
      <li class='hcard'>>
        <span class='firstname'>Ann</span>
        <span class='name'>Collins</span>
      </li>
      <li class='hcard'>>
        <span class='firstname'>John</span>
        <span class='name'>McDonald</span>
      </li>
    </ul>

# Controls
**if** condition and **for** loops are managed.  
**inclusion** is possible, but not secure, by uncommenting the line 63:
    //    {f:_include,i:1,r:"{% include (?<C>[^\\}]+) %}",},
    
    
