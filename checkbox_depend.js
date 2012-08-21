/*
 * checkbox_depend.js
 * by Jason Normore, Copyright 2012
 * MIT License
 *
 * A simple jQuery plugin for handling checkbox dependence. 
 */

(function($) {

  var opts = {
      dataId: 'code'
  }

  var methods = {

    findInput: function(root, code) {
      return $(root).find('input[type="checkbox"][data-' + opts.dataId + '="' + code + '"]');
    },

    init: function(self, rules, options) {
      $.extend(opts, options);
      $(self).addClass(opts.dataId + '-root');

      if(rules) {
        for(var code in rules) {
          var rule = rules[code];
          var e = methods.findInput(self, code);
          if(rule.prereqs) {
            $(e).data('prereqs', rule.prereqs);
          }
          if(rule.conflicts) {
            $(e).data('conflicts', rule.conflicts);
          }
        }
      }

      $(self).on('change', 'input[type="checkbox"]', methods.change);
    },

    change : function(event) {
      var root = $(event.target).closest('.' + opts.dataId + '-root');
      var code = $(event.target).data(opts.dataId);
      console.log('change: ' + code);

      var prereqs = $(this).data('prereqs');
      var conflicts = $(this).data('conflicts');

      if($(event.target).is(':checked')) {
        if(prereqs) {
          for(var i in prereqs) {
            var c = prereqs[i];
            var e = methods.findInput(root, c);
            if(!$(e).is(':checked')) {
              $(e).attr('checked', 'checked');
              $(e).trigger('change');
            }
          }
        }
        if(conflicts) {
          for(var i in conflicts) {
            var c = conflicts[i];
            var e = methods.findInput(root, c);
            $(e).attr('disabled', 'disabled');
          }
        }
      } else {
        // uncheck any that have this as a prereq
        $(root).find('input[type="checkbox"][data-' + opts.dataId + ']:checked').each(function(i, e) {
          var localPrereqs = $(this).data('prereqs');
          var localConflicts = $(this).data('conflicts');
          if(localPrereqs) {
            if($.inArray(code, localPrereqs) != -1) {
              $(this).removeAttr('checked');
              $(this).trigger('change');
            }
          }
        });

        if(conflicts) {
          for(var i in conflicts) {
            var c = conflicts[i];
            var e = methods.findInput(root, c);
            // check if we are the only checked item that has a conflict with this
            var conflictCount = 0;
            $(root).find('input[type="checkbox"][data-' + opts.dataId + ']:checked').each(function(i, e) {
              var localConflicts = $(this).data('conflicts');
              if(localConflicts && $.inArray(code, localConflicts) != -1) {
                conflictCount += 1;
              }
            });

            // if we are the only one, then we can enable it again
            $(e).removeAttr('disabled');
          }
        }
      }
    }

  }

  $.fn.checkboxDepend = function(rules, options) {
    methods.init(this, rules, options);
  };
})(jQuery);